const { clusterStores } = require('./clusteringService');
const { saveConsensus } = require('./consensusStorage');

class RegionalConsensusEngine {
    constructor(consensusThreshold = 0.4) {
        this.consensusThreshold = consensusThreshold;
        this.minStoresForConsensus = 3;
        this.regionalClusters = new Map();
        this.performanceWeights = new Map();
    }

    async initializeRegionalClusters(stores, managerActions) {
        const clusters = clusterStores(stores, managerActions);
        this.regionalClusters = new Map(Object.entries(clusters));
        console.log('Regional clusters initialized:', Array.from(this.regionalClusters.keys()));
    }

    getStoreRegion(storeId) {
        for (const [region, stores] of this.regionalClusters.entries()) {
            if (stores.find(store => store.store_id === storeId)) {
                return region;
            }
        }
        return 'unassigned';
    }

    async validateBehavioralSignals(managerActions, timeWindow = 7) {
        const consensusResults = new Map();
        const regionalSignals = this.groupSignalsByRegion(managerActions, timeWindow);

        for (const [region, signals] of regionalSignals) {
            const consensus = this.calculateRegionalConsensus(region, signals);
            consensusResults.set(region, consensus);
        }

        return this.generateConsensusReport(consensusResults);
    }

    groupSignalsByRegion(managerActions, timeWindow) {
        const regionalSignals = new Map();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

        managerActions.forEach(action => {
            if (new Date(action.timestamp) < cutoffDate) return;

            const region = this.getStoreRegion(action.store_id);
            if (!regionalSignals.has(region)) {
                regionalSignals.set(region, []);
            }
            regionalSignals.get(region).push(action);
        });

        return regionalSignals;
    }

    calculateRegionalConsensus(region, signals) {
        if (signals.length < this.minStoresForConsensus) {
            return {
                region,
                consensus_strength: 0,
                signal_type: 'no_consensus',
                participating_stores: signals.length,
                confidence: 0,
                reasoning: 'insufficient_data'
            };
        }

        const signalTypes = this.groupSignalsByType(signals);
        console.log(`Region: ${region}`);
        console.log('Signal Type Distribution:', Array.from(signalTypes.entries()));
        console.log('Total Signals in Region:', signals.length);

        let strongestConsensus = null;
        let maxStrength = 0;

        for (const [signalType, typeSignals] of signalTypes) {
            const consensus = this.calculateSignalConsensus(region, signalType, typeSignals);

            if (consensus.consensus_strength > maxStrength && consensus.consensus_strength > this.consensusThreshold) {
                maxStrength = consensus.consensus_strength;
                strongestConsensus = consensus;
            }
        }

        return strongestConsensus || {
            region,
            consensus_strength: 0,
            signal_type: 'no_consensus',
            participating_stores: signals.length,
            confidence: 0,
            reasoning: 'signals_too_diverse'
        };
    }

    groupSignalsByType(signals) {
        const types = new Map();

        signals.forEach(signal => {
            const type = signal.extracted_intelligence?.signal || signal.action_type;
            if (!types.has(type)) {
                types.set(type, []);
            }
            types.get(type).push(signal);
        });

        return types;
    }

    calculateSignalConsensus(region, signalType, signals) {
        const uniqueStores = new Set(signals.map(s => s.store_id));
        const totalStoresInRegion = this.getRegionStoreCount(region);
        const participationRate = uniqueStores.size / totalStoresInRegion;

        const weightedSignals = signals.map(signal => ({
            ...signal,
            weight: this.getManagerWeight(signal.manager_id)
        }));

        const averageConfidence = this.calculateWeightedConfidence(weightedSignals);
        const consensusStrength = participationRate * averageConfidence;

        console.log(`Signal Type: ${signalType} in ${region}`);
        console.log(`Participation Rate: ${participationRate}`);
        console.log(`Average Confidence: ${averageConfidence}`);
        console.log(`Consensus Strength: ${consensusStrength}`);

        return {
            region,
            signal_type: signalType,
            consensus_strength: consensusStrength,
            participating_stores: uniqueStores.size,
            total_stores_in_region: totalStoresInRegion,
            participation_rate: participationRate,
            confidence: averageConfidence,
            weighted_signals: weightedSignals.length,
            reasoning: this.generateConsensusReasoning(signalType, consensusStrength, participationRate)
        };
    }

    calculateWeightedConfidence(weightedSignals) {
        if (weightedSignals.length === 0) return 0;

        const totalWeight = weightedSignals.reduce((sum, signal) => sum + signal.weight, 0);
        const weightedConfidenceSum = weightedSignals.reduce((sum, signal) => {
            return sum + (signal.extracted_intelligence?.confidence || 0.8) * signal.weight;
        }, 0);

        return weightedConfidenceSum / totalWeight;
    }

    getManagerWeight(managerId) {
        return this.performanceWeights.get(managerId) || 0.8; // Boosted default for testing
    }

    updateManagerWeights(accuracyData) {
        accuracyData.forEach(({ manager_id, accuracy_score }) => {
            this.performanceWeights.set(manager_id, Math.max(0.1, Math.min(1.0, accuracy_score)));
        });
    }

    generateConsensusReport(consensusResults) {
        const report = {
            timestamp: new Date().toISOString(),
            total_regions: consensusResults.size,
            strong_consensus: [],
            weak_consensus: [],
            no_consensus: [],
            emergency_alerts: []
        };

        consensusResults.forEach(consensus => {
            if (consensus.consensus_strength > 0.8) {
                report.strong_consensus.push(consensus);

                if (this.isEmergencySignal(consensus)) {
                    report.emergency_alerts.push({
                        ...consensus,
                        alert_level: 'high',
                        recommended_action: this.getEmergencyAction(consensus)
                    });
                }
            } else if (consensus.consensus_strength > this.consensusThreshold) {
                report.weak_consensus.push(consensus);
            } else {
                report.no_consensus.push(consensus);
            }
        });

        return report;
    }

    isEmergencySignal(consensus) {
        const emergencySignals = [
            'supply_disruption_expected',
            'demand_spike_critical',
            'competitor_stockout_opportunity'
        ];

        return emergencySignals.includes(consensus.signal_type) &&
               consensus.consensus_strength > 0.75;
    }

    getEmergencyAction(consensus) {
        const actions = {
            'supply_disruption_expected': 'increase_safety_stock_immediately',
            'demand_spike_critical': 'emergency_inventory_allocation',
            'competitor_stockout_opportunity': 'maximize_private_label_push'
        };

        return actions[consensus.signal_type] || 'monitor_closely';
    }

    getRegionStoreCount(region) {
        return this.regionalClusters.get(region)?.length || 5;
    }

    generateConsensusReasoning(signalType, strength, participationRate) {
        if (strength > 0.8) {
            return `Strong regional consensus: ${Math.round(participationRate * 100)}% of stores showing ${signalType}`;
        } else if (strength > 0.6) {
            return `Moderate consensus detected across region`;
        } else {
            return `Weak or conflicting signals in region`;
        }
    }
}

module.exports = RegionalConsensusEngine;
