/**
 * @fileoverview Risk Data Schema types for yobizwiz
 */

export interface ViolationItem {
    violation_id: string;
    violation_type: string;
    regulated_by: string[];
    risk_category: string;
    severity_score: number;
    financial_metrics?: {
        min_fine_estimate_usd?: number;
        max_fine_estimate_usd?: number;
        multiplier_factor?: string;
        occurrence_frequency?: string;
        additional_loss_source?: string[];
    };
    legal_basis?: Record<string, any>;
}

export interface RiskDataSet {
    schema_version: string;
    description: string;
    data_set: ViolationItem[];
}
