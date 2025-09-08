#!/usr/bin/env node
/**
 * TMS (Track Management System) Mock API Server
 * Railway QR Tracker Integration - Smart India Hackathon 2025
 * 
 * Simulates the Track Management System used by Indian Railways
 * for track monitoring, maintenance scheduling, and asset management.
 * 
 * Features:
 * - Track section management
 * - Asset installation tracking
 * - Maintenance scheduling
 * - Condition monitoring
 * - Integration with Railway QR Tracker
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const app = express();

const port = process.env.TMS_PORT || 5000;
const environment = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',    // Backend API
        'http://localhost:3001',    // Frontend Dashboard
        'http://localhost:4000',    // UDM API
        'http://10.0.2.2:3000',     // Android Emulator
        'http://127.0.0.1:3000'     // Flutter development
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Railway-Division'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        error: 'Too many requests to TMS API',
        message: 'Rate limit exceeded for Track Management System'
    }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const division = req.headers['x-railway-division'] || 'Unknown';
    console.log(`${timestamp} - TMS API: ${req.method} ${req.path} - Division: ${division}`);
    next();
});

// ================================
// MOCK DATA - Realistic Railway Track Data
// ================================

// Track sections with detailed information
const trackSections = {
    'DLI-001': {
        section_id: 'DLI-001',
        section_name: 'Delhi Junction - New Delhi',
        route: 'Delhi-Agra Cantt',
        division: 'Delhi Division',
        zone: 'Northern Railway',
        track_type: 'Broad Gauge',
        electrified: true,
        length_km: 25.6,
        max_speed_kmph: 130,
        condition: 'Good',
        last_inspection: '2025-08-25',
        next_inspection_due: '2025-11-25',
        traffic_density: 'High',
        annual_gmt: 45.2,  // Gross Million Tonnes
        rail_section: '60kg/m',
        sleeper_type: 'PSC',
        ballast_type: 'Stone',
        drainage_condition: 'Good',
        signaling_system: 'Electronic Interlocking',
        installed_components: {
            'ERC': 1250,
            'RPD': 850,
            'LNR': 425
        },
        maintenance_cost_annual: 2500000,
        coordinates: {
            start: { lat: 28.6139, lng: 77.2090 },
            end: { lat: 28.6280, lng: 77.2170 }
        }
    },
    'MUM-045': {
        section_id: 'MUM-045',
        section_name: 'Mumbai Central - Andheri',
        route: 'Mumbai-Pune',
        division: 'Mumbai Division',
        zone: 'Western Railway',
        track_type: 'Broad Gauge',
        electrified: true,
        length_km: 22.4,
        max_speed_kmph: 120,
        condition: 'Excellent',
        last_inspection: '2025-08-20',
        next_inspection_due: '2025-11-20',
        traffic_density: 'Very High',
        annual_gmt: 65.8,
        rail_section: '60kg/m',
        sleeper_type: 'PSC',
        ballast_type: 'Stone',
        drainage_condition: 'Excellent',
        signaling_system: 'CBTC',
        installed_components: {
            'ERC': 1120,
            'RPD': 780,
            'LNR': 390
        },
        maintenance_cost_annual: 3200000,
        coordinates: {
            start: { lat: 19.0176, lng: 72.8562 },
            end: { lat: 19.1197, lng: 72.8464 }
        }
    },
    'CHN-089': {
        section_id: 'CHN-089',
        section_name: 'Chennai Central - Tambaram',
        route: 'Chennai-Bangalore',
        division: 'Chennai Division',
        zone: 'Southern Railway',
        track_type: 'Broad Gauge',
        electrified: true,
        length_km: 22.6,
        max_speed_kmph: 110,
        condition: 'Good',
        last_inspection: '2025-08-22',
        next_inspection_due: '2025-11-22',
        traffic_density: 'High',
        annual_gmt: 38.9,
        rail_section: '52kg/m',
        sleeper_type: 'PSC',
        ballast_type: 'Stone',
        drainage_condition: 'Fair',
        signaling_system: 'Electronic Interlocking',
        installed_components: {
            'ERC': 1130,
            'RPD': 800,
            'LNR': 400
        },
        maintenance_cost_annual: 2800000,
        coordinates: {
            start: { lat: 13.0827, lng: 80.2707 },
            end: { lat: 12.9249, lng: 80.1000 }
        }
    },
    'KOL-156': {
        section_id: 'KOL-156',
        section_name: 'Howrah - Sealdah',
        route: 'Kolkata Circular Railway',
        division: 'Howrah Division',
        zone: 'Eastern Railway',
        track_type: 'Broad Gauge',
        electrified: true,
        length_km: 18.7,
        max_speed_kmph: 100,
        condition: 'Fair',
        last_inspection: '2025-08-18',
        next_inspection_due: '2025-11-18',
        traffic_density: 'Very High',
        annual_gmt: 52.3,
        rail_section: '52kg/m',
        sleeper_type: 'Steel Trough',
        ballast_type: 'Stone',
        drainage_condition: 'Poor',
        signaling_system: 'Colour Light',
        installed_components: {
            'ERC': 935,
            'RPD': 650,
            'LNR': 325
        },
        maintenance_cost_annual: 3500000,
        coordinates: {
            start: { lat: 22.5726, lng: 88.3639 },
            end: { lat: 22.5646, lng: 88.3594 }
        }
    },
    'BLR-023': {
        section_id: 'BLR-023',
        section_name: 'Bangalore City - Whitefield',
        route: 'Bangalore-Chennai',
        division: 'Bangalore Division',
        zone: 'South Western Railway',
        track_type: 'Broad Gauge',
        electrified: true,
        length_km: 28.3,
        max_speed_kmph: 120,
        condition: 'Excellent',
        last_inspection: '2025-08-28',
        next_inspection_due: '2025-11-28',
        traffic_density: 'Medium',
        annual_gmt: 25.7,
        rail_section: '60kg/m',
        sleeper_type: 'PSC',
        ballast_type: 'Stone',
        drainage_condition: 'Good',
        signaling_system: 'Electronic Interlocking',
        installed_components: {
            'ERC': 1415,
            'RPD': 980,
            'LNR': 490
        },
        maintenance_cost_annual: 2200000,
        coordinates: {
            start: { lat: 12.9716, lng: 77.5946 },
            end: { lat: 12.9698, lng: 77.7500 }
        }
    }
};

// Maintenance records
const maintenanceRecords = [
    {
        maintenance_id: 'MNT2025001',
        section_id: 'DLI-001',
        maintenance_type: 'Preventive',
        scheduled_date: '2025-09-15',
        completion_date: null,
        status: 'Scheduled',
        crew_assigned: 'Track Gang Alpha',
        estimated_duration_hours: 8,
        components_involved: ['ERC', 'RPD'],
        estimated_cost: 150000,
        priority: 'Medium',
        description: 'Routine inspection and replacement of worn components',
        safety_requirements: ['Track Protection', 'Safety Officer', 'Block Section'],
        equipment_needed: ['Track Trolley', 'Hydraulic Tools', 'Measuring Equipment']
    },
    {
        maintenance_id: 'MNT2025002',
        section_id: 'MUM-045',
        maintenance_type: 'Corrective',
        scheduled_date: '2025-09-10',
        completion_date: '2025-09-10',
        status: 'Completed',
        crew_assigned: 'Track Gang Beta',
        estimated_duration_hours: 12,
        actual_duration_hours: 10,
        components_involved: ['LNR'],
        estimated_cost: 250000,
        actual_cost: 220000,
        priority: 'High',
        description: 'Emergency replacement of damaged liner components',
        safety_requirements: ['Track Protection', 'Safety Officer', 'Block Section'],
        equipment_needed: ['Crane', 'Replacement Components', 'Welding Equipment']
    },
    {
        maintenance_id: 'MNT2025003',
        section_id: 'CHN-089',
        maintenance_type: 'Predictive',
        scheduled_date: '2025-09-20',
        completion_date: null,
        status: 'Planned',
        crew_assigned: 'Track Gang Gamma',
        estimated_duration_hours: 6,
        components_involved: ['ERC'],
        estimated_cost: 180000,
        priority: 'Low',
        description: 'Proactive replacement based on condition monitoring',
        safety_requirements: ['Track Protection', 'Safety Officer'],
        equipment_needed: ['Ultrasonic Testing Equipment', 'Hand Tools']
    }
];

// Asset installation history
const assetInstallations = [
    {
        installation_id: 'INST2025001',
        section_id: 'DLI-001',
        component_type: 'ERC',
        quantity: 50,
        installation_date: '2025-08-15',
        installer_crew: 'Installation Team Alpha',
        qr_codes: ['QR_ERC_DEMO_001_KMRL_2025', 'QR_ERC_DEMO_004_TATA_2025'],
        installation_status: 'Completed',
        quality_check: 'Passed',
        warranty_start: '2025-08-15',
        warranty_end: '2027-08-15',
        installation_cost: 85000,
        km_post_range: { start: 123.450, end: 125.200 }
    },
    {
        installation_id: 'INST2025002',
        section_id: 'MUM-045',
        component_type: 'RPD',
        quantity: 30,
        installation_date: '2025-08-20',
        installer_crew: 'Installation Team Beta',
        qr_codes: ['QR_RPD_DEMO_002_RINL_2025', 'QR_RPD_DEMO_005_JSW_2025'],
        installation_status: 'Completed',
        quality_check: 'Passed',
        warranty_start: '2025-08-20',
        warranty_end: '2029-08-20',
        installation_cost: 72000,
        km_post_range: { start: 456.789, end: 458.200 }
    }
];

// Track condition monitoring data
const conditionMonitoring = {
    'DLI-001': {
        rail_wear: 'Normal',
        rail_corrugation: 'Slight',
        track_geometry: 'Good',
        ballast_condition: 'Good',
        drainage_efficiency: 85,
        noise_level_db: 68,
        vibration_level: 'Normal',
        last_ultrasonic_test: '2025-08-25',
        next_test_due: '2025-11-25',
        critical_defects: 0,
        minor_defects: 3,
        overall_score: 8.2
    },
    'MUM-045': {
        rail_wear: 'Slight',
        rail_corrugation: 'None',
        track_geometry: 'Excellent',
        ballast_condition: 'Excellent',
        drainage_efficiency: 92,
        noise_level_db: 65,
        vibration_level: 'Low',
        last_ultrasonic_test: '2025-08-20',
        next_test_due: '2025-11-20',
        critical_defects: 0,
        minor_defects: 1,
        overall_score: 9.1
    },
    'CHN-089': {
        rail_wear: 'Normal',
        rail_corrugation: 'Moderate',
        track_geometry: 'Good',
        ballast_condition: 'Fair',
        drainage_efficiency: 78,
        noise_level_db: 72,
        vibration_level: 'Normal',
        last_ultrasonic_test: '2025-08-22',
        next_test_due: '2025-11-22',
        critical_defects: 1,
        minor_defects: 5,
        overall_score: 7.6
    }
};

// ================================
// API ENDPOINTS
// ================================

// Health check
app.get('/api/health', (req, res) => {
    const healthStatus = {
        service: 'TMS (Track Management System) API',
        status: 'operational',
        version: '2.3.0', 
        timestamp: new Date().toISOString(),
        environment: environment,
        uptime: process.uptime(),
        system_info: {
            node_version: process.version,
            memory_usage: process.memoryUsage(),
            platform: process.platform
        },
        database_status: 'connected',
        integration_status: {
            track_monitoring: 'online',
            asset_management: 'online',
            maintenance_system: 'online',
            safety_system: 'online'
        },
        active_sections: Object.keys(trackSections).length,
        maintenance_items: maintenanceRecords.length
    };

    res.status(200).json(healthStatus);
});

// Get all track sections
app.get('/api/track/sections', (req, res) => {
    try {
        const { zone, division, condition, traffic_density } = req.query;

        let filteredSections = Object.values(trackSections);

        // Apply filters
        if (zone) {
            filteredSections = filteredSections.filter(section => 
                section.zone.toLowerCase().includes(zone.toLowerCase())
            );
        }

        if (division) {
            filteredSections = filteredSections.filter(section => 
                section.division.toLowerCase().includes(division.toLowerCase())
            );
        }

        if (condition) {
            filteredSections = filteredSections.filter(section => 
                section.condition.toLowerCase() === condition.toLowerCase()
            );
        }

        if (traffic_density) {
            filteredSections = filteredSections.filter(section => 
                section.traffic_density.toLowerCase().includes(traffic_density.toLowerCase())
            );
        }

        const response = {
            success: true,
            track_sections: filteredSections,
            total_count: filteredSections.length,
            summary: {
                total_length_km: filteredSections.reduce((sum, section) => sum + section.length_km, 0),
                avg_condition_score: (filteredSections.reduce((sum, section) => {
                    const scores = { 'Excellent': 5, 'Good': 4, 'Fair': 3, 'Poor': 2, 'Critical': 1 };
                    return sum + (scores[section.condition] || 3);
                }, 0) / filteredSections.length).toFixed(1),
                electrified_sections: filteredSections.filter(s => s.electrified).length,
                total_maintenance_cost: filteredSections.reduce((sum, s) => sum + s.maintenance_cost_annual, 0)
            },
            filters_applied: { zone, division, condition, traffic_density }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching track sections:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve track sections'
        });
    }
});

// Get specific track section details
app.get('/api/track/section/:id', (req, res) => {
    try {
        const { id } = req.params;
        const section = trackSections[id];

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Track section not found',
                message: `Section '${id}' does not exist`
            });
        }

        // Get related data
        const sectionMaintenance = maintenanceRecords.filter(m => m.section_id === id);
        const sectionInstallations = assetInstallations.filter(a => a.section_id === id);
        const sectionCondition = conditionMonitoring[id] || {};

        const response = {
            success: true,
            section_details: section,
            condition_monitoring: sectionCondition,
            maintenance_history: sectionMaintenance,
            recent_installations: sectionInstallations,
            performance_metrics: {
                maintenance_scheduled: sectionMaintenance.filter(m => m.status === 'Scheduled').length,
                components_installed: section.installed_components,
                last_major_maintenance: sectionMaintenance.find(m => m.maintenance_type === 'Corrective')?.completion_date || 'N/A',
                safety_score: calculateSafetyScore(section, sectionCondition),
                utilization_rate: ((section.annual_gmt / 100) * 100).toFixed(1) + '%'
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching track section details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve section details'
        });
    }
});

// Calculate safety score based on section and condition data
function calculateSafetyScore(section, condition) {
    let score = 100;
    
    // Deduct points based on condition
    if (section.condition === 'Poor') score -= 20;
    else if (section.condition === 'Fair') score -= 10;
    else if (section.condition === 'Good') score -= 5;
    
    // Deduct for critical defects
    if (condition.critical_defects) {
        score -= condition.critical_defects * 15;
    }
    
    // Deduct for minor defects
    if (condition.minor_defects) {
        score -= condition.minor_defects * 3;
    }
    
    // Deduct for poor drainage
    if (condition.drainage_efficiency < 80) {
        score -= (80 - condition.drainage_efficiency) * 0.5;
    }
    
    return Math.max(0, Math.min(100, score)).toFixed(1);
}

// Record component installation
app.post('/api/maintenance/component-installation', (req, res) => {
    try {
        const { 
            section_id, 
            component_type, 
            quantity, 
            qr_codes = [], 
            installer_crew,
            installation_notes,
            km_post_start,
            km_post_end
        } = req.body;

        // Validation
        if (!section_id || !component_type || !quantity) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['section_id', 'component_type', 'quantity']
            });
        }

        const section = trackSections[section_id];
        if (!section) {
            return res.status(400).json({
                success: false,
                error: 'Invalid section ID',
                available_sections: Object.keys(trackSections)
            });
        }

        // Create installation record
        const installation = {
            installation_id: `INST${new Date().getFullYear()}${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
            section_id: section_id,
            section_name: section.section_name,
            component_type: component_type.toUpperCase(),
            quantity: parseInt(quantity),
            installation_date: new Date().toISOString().split('T')[0],
            installer_crew: installer_crew || 'Installation Team',
            qr_codes: qr_codes,
            installation_status: 'Completed',
            quality_check: 'Passed',
            warranty_start: new Date().toISOString().split('T')[0],
            warranty_end: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years
            installation_cost: quantity * getComponentInstallationCost(component_type),
            installation_notes: installation_notes || '',
            km_post_range: {
                start: km_post_start || section.coordinates.start.lat,
                end: km_post_end || section.coordinates.end.lat
            },
            created_at: new Date().toISOString()
        };

        // Update section component count
        if (section.installed_components[component_type.toUpperCase()]) {
            section.installed_components[component_type.toUpperCase()] += parseInt(quantity);
        } else {
            section.installed_components[component_type.toUpperCase()] = parseInt(quantity);
        }

        // Add to installation history
        assetInstallations.push(installation);

        const response = {
            success: true,
            message: 'Component installation recorded successfully',
            installation: installation,
            section_update: {
                section_id: section_id,
                updated_component_count: section.installed_components,
                total_components: Object.values(section.installed_components).reduce((sum, count) => sum + count, 0)
            },
            next_steps: [
                'Quality inspection will be scheduled',
                'Component warranty tracking activated',
                'Maintenance schedule will be updated'
            ]
        };

        res.status(201).json(response);

    } catch (error) {
        console.error('Error recording installation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record component installation'
        });
    }
});

// Helper function to get installation cost by component type
function getComponentInstallationCost(componentType) {
    const costs = {
        'ERC': 1200,
        'RPD': 1800,
        'LNR': 2200
    };
    return costs[componentType.toUpperCase()] || 1500;
}

// Get maintenance schedule
app.get('/api/maintenance/schedule', (req, res) => {
    try {
        const { section_id, status, maintenance_type, from_date, to_date } = req.query;

        let filteredMaintenance = maintenanceRecords.slice();

        // Apply filters
        if (section_id) {
            filteredMaintenance = filteredMaintenance.filter(m => m.section_id === section_id);
        }

        if (status) {
            filteredMaintenance = filteredMaintenance.filter(m => 
                m.status.toLowerCase() === status.toLowerCase()
            );
        }

        if (maintenance_type) {
            filteredMaintenance = filteredMaintenance.filter(m => 
                m.maintenance_type.toLowerCase() === maintenance_type.toLowerCase()
            );
        }

        if (from_date) {
            filteredMaintenance = filteredMaintenance.filter(m => 
                m.scheduled_date >= from_date
            );
        }

        if (to_date) {
            filteredMaintenance = filteredMaintenance.filter(m => 
                m.scheduled_date <= to_date
            );
        }

        const response = {
            success: true,
            maintenance_schedule: filteredMaintenance,
            total_items: filteredMaintenance.length,
            summary: {
                scheduled: filteredMaintenance.filter(m => m.status === 'Scheduled').length,
                completed: filteredMaintenance.filter(m => m.status === 'Completed').length,
                planned: filteredMaintenance.filter(m => m.status === 'Planned').length,
                total_estimated_cost: filteredMaintenance.reduce((sum, m) => sum + m.estimated_cost, 0),
                avg_duration: filteredMaintenance.length > 0 ? 
                    (filteredMaintenance.reduce((sum, m) => sum + m.estimated_duration_hours, 0) / filteredMaintenance.length).toFixed(1) : 0
            },
            filters_applied: { section_id, status, maintenance_type, from_date, to_date }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching maintenance schedule:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve maintenance schedule'
        });
    }
});

// Schedule new maintenance
app.post('/api/maintenance/schedule', (req, res) => {
    try {
        const {
            section_id,
            maintenance_type,
            scheduled_date,
            priority = 'Medium',
            description,
            components_involved = [],
            estimated_duration_hours,
            crew_assignment
        } = req.body;

        // Validation
        if (!section_id || !maintenance_type || !scheduled_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['section_id', 'maintenance_type', 'scheduled_date']
            });
        }

        const section = trackSections[section_id];
        if (!section) {
            return res.status(400).json({
                success: false,
                error: 'Invalid section ID'
            });
        }

        // Create maintenance record
        const maintenance = {
            maintenance_id: `MNT${new Date().getFullYear()}${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
            section_id: section_id,
            section_name: section.section_name,
            maintenance_type: maintenance_type,
            scheduled_date: scheduled_date,
            completion_date: null,
            status: 'Scheduled',
            crew_assigned: crew_assignment || 'To be assigned',
            estimated_duration_hours: estimated_duration_hours || 8,
            components_involved: components_involved,
            estimated_cost: calculateMaintenanceCost(maintenance_type, components_involved, estimated_duration_hours),
            priority: priority,
            description: description || `${maintenance_type} maintenance for ${section.section_name}`,
            safety_requirements: getSafetyRequirements(maintenance_type),
            equipment_needed: getEquipmentNeeded(maintenance_type, components_involved),
            created_at: new Date().toISOString()
        };

        // Add to maintenance records
        maintenanceRecords.push(maintenance);

        const response = {
            success: true,
            message: 'Maintenance scheduled successfully',
            maintenance: maintenance,
            notifications: [
                'Crew assignment notification sent',
                'Safety clearance requested',
                'Equipment allocation initiated'
            ]
        };

        res.status(201).json(response);

    } catch (error) {
        console.error('Error scheduling maintenance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule maintenance'
        });
    }
});

// Helper functions for maintenance scheduling
function calculateMaintenanceCost(type, components, duration) {
    const baseCosts = {
        'Preventive': 50000,
        'Corrective': 150000,
        'Predictive': 80000,
        'Emergency': 300000
    };

    let cost = baseCosts[type] || 100000;
    cost += (duration || 8) * 5000; // Labor cost
    cost += components.length * 20000; // Component cost

    return cost;
}

function getSafetyRequirements(type) {
    const requirements = {
        'Preventive': ['Track Protection', 'Safety Officer'],
        'Corrective': ['Track Protection', 'Safety Officer', 'Block Section'],
        'Predictive': ['Track Protection', 'Safety Officer'],
        'Emergency': ['Track Protection', 'Safety Officer', 'Block Section', 'Emergency Response Team']
    };

    return requirements[type] || ['Track Protection', 'Safety Officer'];
}

function getEquipmentNeeded(type, components) {
    let equipment = ['Hand Tools', 'Measuring Equipment'];

    if (type === 'Corrective' || type === 'Emergency') {
        equipment.push('Hydraulic Tools', 'Crane', 'Welding Equipment');
    }

    if (components.includes('ERC')) {
        equipment.push('Rail Clip Tools');
    }

    if (components.includes('RPD')) {
        equipment.push('Pad Installation Tools');
    }

    if (components.includes('LNR')) {
        equipment.push('Liner Handling Equipment');
    }

    return [...new Set(equipment)]; // Remove duplicates
}

// Get track condition monitoring data
app.get('/api/track/condition/:section_id', (req, res) => {
    try {
        const { section_id } = req.params;
        
        const section = trackSections[section_id];
        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        const condition = conditionMonitoring[section_id] || {};

        const response = {
            success: true,
            section_id: section_id,
            section_name: section.section_name,
            condition_data: condition,
            recommendations: generateConditionRecommendations(condition),
            trend_analysis: {
                overall_trend: 'Stable',
                critical_areas: identifyCriticalAreas(condition),
                next_inspection_priority: calculateInspectionPriority(condition)
            },
            last_updated: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching condition data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve condition data'
        });
    }
});

// Helper functions for condition monitoring
function generateConditionRecommendations(condition) {
    const recommendations = [];

    if (condition.critical_defects > 0) {
        recommendations.push('Immediate inspection and repair required for critical defects');
    }

    if (condition.drainage_efficiency < 80) {
        recommendations.push('Improve drainage system to prevent waterlogging');
    }

    if (condition.rail_corrugation === 'Moderate' || condition.rail_corrugation === 'Severe') {
        recommendations.push('Plan rail grinding to address corrugation');
    }

    if (condition.overall_score < 7) {
        recommendations.push('Comprehensive track renewal recommended');
    }

    if (recommendations.length === 0) {
        recommendations.push('Continue routine maintenance schedule');
    }

    return recommendations;
}

function identifyCriticalAreas(condition) {
    const areas = [];

    if (condition.critical_defects > 0) areas.push('Critical Rail Defects');
    if (condition.drainage_efficiency < 70) areas.push('Drainage System');
    if (condition.rail_wear === 'Severe') areas.push('Rail Wear');
    if (condition.ballast_condition === 'Poor') areas.push('Ballast Condition');

    return areas;
}

function calculateInspectionPriority(condition) {
    if (condition.critical_defects > 0 || condition.overall_score < 6) {
        return 'High';
    } else if (condition.minor_defects > 3 || condition.overall_score < 8) {
        return 'Medium';
    } else {
        return 'Low';
    }
}

// Integration endpoint for Railway QR Tracker
app.post('/api/integration/track-asset-update', (req, res) => {
    try {
        const { 
            qr_code, 
            component_id, 
            component_type, 
            track_section, 
            scan_location,
            condition_report
        } = req.body;

        if (!qr_code || !track_section) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['qr_code', 'track_section']
            });
        }

        const section = trackSections[track_section];
        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Track section not found in TMS'
            });
        }

        // Create integration response
        const integrationResponse = {
            success: true,
            tms_reference: uuidv4(),
            track_verification: {
                section_verified: true,
                section_details: {
                    section_id: section.section_id,
                    section_name: section.section_name,
                    condition: section.condition,
                    last_inspection: section.last_inspection,
                    next_maintenance: section.next_inspection_due
                }
            },
            asset_status: {
                component_registered: true,
                installation_verified: true,
                warranty_status: 'Active',
                maintenance_due: calculateNextMaintenance(component_type, section)
            },
            recommendations: [
                'Component successfully verified in track section',
                'Continue routine monitoring',
                'Next inspection scheduled as per maintenance plan'
            ],
            integration_timestamp: new Date().toISOString()
        };

        // If condition report provided, create maintenance recommendation
        if (condition_report && condition_report.issues_detected) {
            integrationResponse.maintenance_alert = {
                priority: condition_report.severity || 'Medium',
                recommended_action: 'Schedule inspection within 7 days',
                estimated_cost: getComponentInstallationCost(component_type) * 0.5
            };
        }

        res.status(200).json(integrationResponse);

    } catch (error) {
        console.error('Error processing track asset update:', error);
        res.status(500).json({
            success: false,
            error: 'Track asset update processing failed'
        });
    }
});

function calculateNextMaintenance(componentType, section) {
    const intervals = {
        'ERC': 90,  // days
        'RPD': 120,
        'LNR': 150
    };

    const interval = intervals[componentType.toUpperCase()] || 120;
    const nextDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
    
    return nextDate.toISOString().split('T')[0];
}

// Analytics endpoint
app.get('/api/analytics/track-performance', (req, res) => {
    try {
        const { zone, period = 'monthly' } = req.query;

        let sections = Object.values(trackSections);
        
        if (zone) {
            sections = sections.filter(s => 
                s.zone.toLowerCase().includes(zone.toLowerCase())
            );
        }

        const analytics = {
            performance_summary: {
                total_sections: sections.length,
                total_length_km: sections.reduce((sum, s) => sum + s.length_km, 0),
                avg_condition_score: calculateAverageCondition(sections),
                total_annual_traffic_gmt: sections.reduce((sum, s) => sum + s.annual_gmt, 0),
                electrified_percentage: (sections.filter(s => s.electrified).length / sections.length * 100).toFixed(1)
            },
            condition_distribution: {
                excellent: sections.filter(s => s.condition === 'Excellent').length,
                good: sections.filter(s => s.condition === 'Good').length,
                fair: sections.filter(s => s.condition === 'Fair').length,
                poor: sections.filter(s => s.condition === 'Poor').length
            },
            maintenance_metrics: {
                total_scheduled: maintenanceRecords.filter(m => m.status === 'Scheduled').length,
                total_completed: maintenanceRecords.filter(m => m.status === 'Completed').length,
                avg_cost_per_section: sections.reduce((sum, s) => sum + s.maintenance_cost_annual, 0) / sections.length,
                total_maintenance_budget: sections.reduce((sum, s) => sum + s.maintenance_cost_annual, 0)
            },
            component_analytics: {
                total_components: sections.reduce((sum, s) => 
                    sum + Object.values(s.installed_components).reduce((total, count) => total + count, 0), 0
                ),
                erc_components: sections.reduce((sum, s) => sum + (s.installed_components.ERC || 0), 0),
                rpd_components: sections.reduce((sum, s) => sum + (s.installed_components.RPD || 0), 0),
                lnr_components: sections.reduce((sum, s) => sum + (s.installed_components.LNR || 0), 0)
            },
            recommendations: [
                'Focus maintenance efforts on Fair and Poor condition sections',
                'Consider predictive maintenance for high-traffic sections',
                'Optimize component replacement schedules based on usage patterns',
                'Implement condition-based monitoring for critical sections'
            ]
        };

        const response = {
            success: true,
            analytics: analytics,
            period: period,
            zone_filter: zone || 'All Zones',
            generated_at: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error generating track performance analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate analytics'
        });
    }
});

function calculateAverageCondition(sections) {
    const scores = { 'Excellent': 5, 'Good': 4, 'Fair': 3, 'Poor': 2, 'Critical': 1 };
    const totalScore = sections.reduce((sum, section) => sum + (scores[section.condition] || 3), 0);
    return (totalScore / sections.length).toFixed(1);
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('TMS API Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred in TMS API',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `TMS API endpoint ${req.method} ${req.path} not found`,
        available_endpoints: [
            'GET /api/health',
            'GET /api/track/sections',
            'GET /api/track/section/:id',
            'POST /api/maintenance/component-installation',
            'GET /api/maintenance/schedule',
            'POST /api/maintenance/schedule',
            'GET /api/track/condition/:section_id',
            'POST /api/integration/track-asset-update',
            'GET /api/analytics/track-performance'
        ]
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log('🚆 TMS (Track Management System) API Server');
    console.log('=============================================');
    console.log(`🚀 Server running on: http://localhost:${port}`);
    console.log(`🌐 Network access: http://0.0.0.0:${port}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
    console.log('');
    console.log('📋 Available Services:');
    console.log('   🛤️  Track Section Management');
    console.log('   🔧 Maintenance Scheduling');
    console.log('   📊 Condition Monitoring');
    console.log('   🏗️  Asset Installation Tracking');
    console.log('   📈 Performance Analytics');
    console.log('   🔌 Railway QR Tracker Integration');
    console.log('');
    console.log('🚂 Simulating Indian Railways TMS System');
    console.log('🏆 Smart India Hackathon 2025 Ready!');
});

module.exports = app;
