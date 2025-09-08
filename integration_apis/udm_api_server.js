#!/usr/bin/env node
/**
 * UDM (Unified Data Management) Mock API Server
 * Railway QR Tracker Integration - Smart India Hackathon 2025
 * 
 * Simulates the Unified Data Management system used by Indian Railways
 * for inventory management, procurement, and asset tracking.
 * 
 * Features:
 * - Component inventory management
 * - Procurement tracking
 * - Supplier information
 * - Cost analysis
 * - Integration with Railway QR Tracker
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const app = express();

const port = process.env.UDM_PORT || 4000;
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

// CORS configuration for railway systems integration
app.use(cors({
    origin: [
        'http://localhost:3000',    // Backend API
        'http://localhost:3001',    // Frontend Dashboard
        'http://localhost:5000',    // TMS API
        'http://10.0.2.2:3000',     // Android Emulator
        'http://127.0.0.1:3000'     // Flutter development
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Railway-Zone'],
    credentials: true
}));

// Rate limiting for production readiness
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests to UDM API',
        message: 'Rate limit exceeded. Please try again later.'
    }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const zone = req.headers['x-railway-zone'] || 'Unknown';
    console.log(`${timestamp} - UDM API: ${req.method} ${req.path} - Zone: ${zone}`);
    next();
});

// ================================
// MOCK DATA - Realistic Railway Inventory
// ================================

// Component inventory with realistic Indian Railways data
const inventory = {
    'ERC': {
        total: 2500000,
        available: 1800000,
        reserved: 500000,
        in_transit: 150000,
        defective: 50000,
        unit_cost: 850.00,
        supplier_count: 8,
        last_procurement_date: '2025-08-15',
        avg_lead_time_days: 45,
        quality_grade: 'A',
        specifications: {
            material: 'High Carbon Steel',
            tensile_strength: '1200 MPa',
            fatigue_life: '2M cycles',
            weight: '2.5 kg',
            dimensions: '150x80x25 mm'
        }
    },
    'RPD': {
        total: 1200000,
        available: 950000,
        reserved: 150000,
        in_transit: 75000,
        defective: 25000,
        unit_cost: 1200.00,
        supplier_count: 6,
        last_procurement_date: '2025-08-20',
        avg_lead_time_days: 30,
        quality_grade: 'A+',
        specifications: {
            material: 'EPDM Rubber',
            hardness: '70 Shore A',
            temperature_range: '-40°C to +80°C',
            weight: '1.8 kg',
            dimensions: '300x150x20 mm'
        }
    },
    'LNR': {
        total: 800000,
        available: 650000,
        reserved: 100000,
        in_transit: 35000,
        defective: 15000,
        unit_cost: 950.00,
        supplier_count: 5,
        last_procurement_date: '2025-08-10',
        avg_lead_time_days: 35,
        quality_grade: 'A',
        specifications: {
            material: 'Composite Polymer',
            load_capacity: '25 tonnes',
            wear_resistance: 'Class A',
            weight: '3.2 kg',
            dimensions: '200x100x30 mm'
        }
    }
};

// Supplier information for Indian Railways
const suppliers = [
    {
        supplier_id: 'SUP001',
        name: 'KMRL Industries Pvt Ltd',
        location: 'Kochi, Kerala',
        established: 1995,
        specialization: ['ERC', 'LNR'],
        quality_rating: 4.8,
        delivery_rating: 4.6,
        total_contracts: 156,
        annual_supply_value: 125000000,
        certifications: ['ISO 9001', 'ISO 14001', 'RDSO Approved'],
        contact: {
            email: 'procurement@kmrl.in',
            phone: '+91-484-2345678',
            address: 'Industrial Estate, Kalamassery, Kochi - 683104'
        }
    },
    {
        supplier_id: 'SUP002',
        name: 'RINL Steel Components',
        location: 'Visakhapatnam, Andhra Pradesh',
        established: 1982,
        specialization: ['ERC', 'RPD'],
        quality_rating: 4.9,
        delivery_rating: 4.7,
        total_contracts: 203,
        annual_supply_value: 185000000,
        certifications: ['ISO 9001', 'TS 16949', 'RDSO Approved', 'BIS Certified'],
        contact: {
            email: 'sales@rinl.in',
            phone: '+91-891-2345678',
            address: 'Steel Plant Township, Visakhapatnam - 530031'
        }
    },
    {
        supplier_id: 'SUP003',
        name: 'SAIL Railway Components',
        location: 'Bhilai, Chhattisgarh',
        established: 1959,
        specialization: ['ERC', 'RPD', 'LNR'],
        quality_rating: 4.7,
        delivery_rating: 4.5,
        total_contracts: 298,
        annual_supply_value: 245000000,
        certifications: ['ISO 9001', 'ISO 45001', 'RDSO Approved'],
        contact: {
            email: 'railway.components@sail.in',
            phone: '+91-788-2345678',
            address: 'Bhilai Steel Plant, Bhilai - 490001'
        }
    },
    {
        supplier_id: 'SUP004',
        name: 'Tata Steel Railway Division',
        location: 'Jamshedpur, Jharkhand',
        established: 1907,
        specialization: ['ERC', 'LNR'],
        quality_rating: 4.9,
        delivery_rating: 4.8,
        total_contracts: 412,
        annual_supply_value: 320000000,
        certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'RDSO Approved'],
        contact: {
            email: 'railway@tatasteel.com',
            phone: '+91-657-2345678',
            address: 'Jamshedpur Works, Jamshedpur - 831001'
        }
    },
    {
        supplier_id: 'SUP005',
        name: 'JSW Steel Infrastructure',
        location: 'Bellary, Karnataka',
        established: 1982,
        specialization: ['RPD', 'LNR'],
        quality_rating: 4.6,
        delivery_rating: 4.4,
        total_contracts: 167,
        annual_supply_value: 98000000,
        certifications: ['ISO 9001', 'RDSO Approved'],
        contact: {
            email: 'infra@jsw.in',
            phone: '+91-839-2345678',
            address: 'Toranagallu Industrial Area, Bellary - 583275'
        }
    }
];

// Procurement history for analytics
const procurementHistory = [
    {
        po_number: 'PO2025001',
        component_type: 'ERC',
        quantity: 50000,
        unit_cost: 850.00,
        total_cost: 42500000,
        supplier_id: 'SUP001',
        order_date: '2025-07-15',
        delivery_date: '2025-08-30',
        status: 'Delivered',
        quality_inspection: 'Passed',
        railway_zone: 'Southern Railway'
    },
    {
        po_number: 'PO2025002',
        component_type: 'RPD',
        quantity: 30000,
        unit_cost: 1200.00,
        total_cost: 36000000,
        supplier_id: 'SUP002',
        order_date: '2025-07-20',
        delivery_date: '2025-08-25',
        status: 'Delivered',
        quality_inspection: 'Passed',
        railway_zone: 'Eastern Railway'
    },
    {
        po_number: 'PO2025003',
        component_type: 'LNR',
        quantity: 25000,
        unit_cost: 950.00,
        total_cost: 23750000,
        supplier_id: 'SUP003',
        order_date: '2025-08-01',
        delivery_date: '2025-09-15',
        status: 'In Transit',
        quality_inspection: 'Pending',
        railway_zone: 'Western Railway'
    }
];

// Railway zones for distribution
const railwayZones = [
    { code: 'CR', name: 'Central Railway', headquarters: 'Mumbai' },
    { code: 'WR', name: 'Western Railway', headquarters: 'Mumbai' },
    { code: 'NR', name: 'Northern Railway', headquarters: 'Delhi' },
    { code: 'SR', name: 'Southern Railway', headquarters: 'Chennai' },
    { code: 'ER', name: 'Eastern Railway', headquarters: 'Kolkata' },
    { code: 'NFR', name: 'Northeast Frontier Railway', headquarters: 'Guwahati' },
    { code: 'NCR', name: 'North Central Railway', headquarters: 'Allahabad' },
    { code: 'NER', name: 'North Eastern Railway', headquarters: 'Gorakhpur' },
    { code: 'SER', name: 'South Eastern Railway', headquarters: 'Kolkata' },
    { code: 'SCR', name: 'South Central Railway', headquarters: 'Secunderabad' }
];

// ================================
// API ENDPOINTS
// ================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    const healthStatus = {
        service: 'UDM (Unified Data Management) API',
        status: 'healthy',
        version: '2.1.0',
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
            erp_system: 'online',
            procurement_system: 'online',
            inventory_system: 'online',
            quality_management: 'online'
        }
    };

    res.status(200).json(healthStatus);
});

// Get inventory status for a specific component type
app.get('/api/inventory/status/:type', (req, res) => {
    try {
        const { type } = req.params;
        const componentType = type.toUpperCase();
        
        if (!inventory[componentType]) {
            return res.status(404).json({
                success: false,
                error: 'Component type not found',
                message: `Component type '${componentType}' is not available in inventory`,
                available_types: Object.keys(inventory)
            });
        }

        const inventoryData = inventory[componentType];
        const utilizationRate = ((inventoryData.total - inventoryData.available) / inventoryData.total * 100).toFixed(2);
        const stockStatus = inventoryData.available > inventoryData.total * 0.2 ? 'Normal' : 
                           inventoryData.available > inventoryData.total * 0.1 ? 'Low' : 'Critical';

        const response = {
            success: true,
            component_type: componentType,
            inventory_details: {
                ...inventoryData,
                utilization_rate: parseFloat(utilizationRate),
                stock_status: stockStatus,
                total_value: inventoryData.total * inventoryData.unit_cost,
                available_value: inventoryData.available * inventoryData.unit_cost,
                reorder_point: Math.floor(inventoryData.total * 0.15),
                safety_stock: Math.floor(inventoryData.total * 0.05)
            },
            last_updated: new Date().toISOString(),
            data_source: 'UDM Primary Database'
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching inventory status:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve inventory status'
        });
    }
});

// Get complete inventory overview
app.get('/api/inventory/overview', (req, res) => {
    try {
        const overview = {
            success: true,
            inventory_summary: {
                total_components: Object.values(inventory).reduce((sum, item) => sum + item.total, 0),
                total_available: Object.values(inventory).reduce((sum, item) => sum + item.available, 0),
                total_value: Object.values(inventory).reduce((sum, item) => sum + (item.total * item.unit_cost), 0),
                component_types: Object.keys(inventory).length,
                supplier_count: [...new Set(suppliers.map(s => s.supplier_id))].length
            },
            by_component_type: Object.entries(inventory).map(([type, data]) => ({
                component_type: type,
                total_stock: data.total,
                available_stock: data.available,
                reserved_stock: data.reserved,
                utilization_rate: ((data.total - data.available) / data.total * 100).toFixed(2),
                unit_cost: data.unit_cost,
                total_value: data.total * data.unit_cost,
                stock_status: data.available > data.total * 0.2 ? 'Normal' : 
                             data.available > data.total * 0.1 ? 'Low' : 'Critical'
            })),
            last_updated: new Date().toISOString()
        };

        res.status(200).json(overview);

    } catch (error) {
        console.error('Error generating inventory overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate inventory overview'
        });
    }
});

// Update inventory (consumption/addition)
app.post('/api/inventory/update', (req, res) => {
    try {
        const { component_type, quantity, operation, zone, reason, reference_id } = req.body;
        
        // Validation
        if (!component_type || !quantity || !operation) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['component_type', 'quantity', 'operation']
            });
        }

        const componentType = component_type.toUpperCase();
        if (!inventory[componentType]) {
            return res.status(404).json({
                success: false,
                error: 'Component type not found',
                message: `Component type '${componentType}' is not available`
            });
        }

        const inventoryData = inventory[componentType];
        const updateQuantity = parseInt(quantity);

        if (isNaN(updateQuantity) || updateQuantity <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid quantity',
                message: 'Quantity must be a positive number'
            });
        }

        // Update inventory based on operation
        let updatedData = { ...inventoryData };
        let operationDescription = '';

        switch (operation.toLowerCase()) {
            case 'consume':
            case 'issue':
                if (updatedData.available < updateQuantity) {
                    return res.status(400).json({
                        success: false,
                        error: 'Insufficient stock',
                        message: `Only ${updatedData.available} units available, cannot issue ${updateQuantity}`
                    });
                }
                updatedData.available -= updateQuantity;
                operationDescription = `Issued ${updateQuantity} units`;
                break;

            case 'add':
            case 'receive':
                updatedData.available += updateQuantity;
                updatedData.total += updateQuantity;
                operationDescription = `Received ${updateQuantity} units`;
                break;

            case 'reserve':
                if (updatedData.available < updateQuantity) {
                    return res.status(400).json({
                        success: false,
                        error: 'Insufficient stock for reservation',
                        message: `Only ${updatedData.available} units available`
                    });
                }
                updatedData.available -= updateQuantity;
                updatedData.reserved += updateQuantity;
                operationDescription = `Reserved ${updateQuantity} units`;
                break;

            case 'unreserve':
                if (updatedData.reserved < updateQuantity) {
                    return res.status(400).json({
                        success: false,
                        error: 'Cannot unreserve more than reserved',
                        message: `Only ${updatedData.reserved} units reserved`
                    });
                }
                updatedData.reserved -= updateQuantity;
                updatedData.available += updateQuantity;
                operationDescription = `Unreserved ${updateQuantity} units`;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation',
                    valid_operations: ['consume', 'issue', 'add', 'receive', 'reserve', 'unreserve']
                });
        }

        // Update the inventory
        inventory[componentType] = updatedData;

        // Create transaction record
        const transaction = {
            transaction_id: uuidv4(),
            component_type: componentType,
            operation: operation.toLowerCase(),
            quantity: updateQuantity,
            zone: zone || 'Central',
            reason: reason || 'Manual update',
            reference_id: reference_id || null,
            timestamp: new Date().toISOString(),
            previous_available: inventoryData.available,
            new_available: updatedData.available,
            user: 'UDM System'
        };

        const response = {
            success: true,
            message: `Inventory updated successfully: ${operationDescription}`,
            transaction: transaction,
            updated_inventory: {
                component_type: componentType,
                total: updatedData.total,
                available: updatedData.available,
                reserved: updatedData.reserved,
                in_transit: updatedData.in_transit,
                defective: updatedData.defective
            },
            alerts: []
        };

        // Generate alerts for low stock
        if (updatedData.available < updatedData.total * 0.1) {
            response.alerts.push({
                type: 'critical',
                message: `Critical stock level for ${componentType}: Only ${updatedData.available} units remaining`
            });
        } else if (updatedData.available < updatedData.total * 0.2) {
            response.alerts.push({
                type: 'warning',
                message: `Low stock level for ${componentType}: ${updatedData.available} units remaining`
            });
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update inventory',
            message: error.message
        });
    }
});

// Get supplier information
app.get('/api/suppliers', (req, res) => {
    try {
        const { component_type, quality_rating_min, location } = req.query;

        let filteredSuppliers = suppliers;

        // Filter by component type
        if (component_type) {
            const componentType = component_type.toUpperCase();
            filteredSuppliers = filteredSuppliers.filter(supplier => 
                supplier.specialization.includes(componentType)
            );
        }

        // Filter by minimum quality rating
        if (quality_rating_min) {
            const minRating = parseFloat(quality_rating_min);
            filteredSuppliers = filteredSuppliers.filter(supplier => 
                supplier.quality_rating >= minRating
            );
        }

        // Filter by location
        if (location) {
            filteredSuppliers = filteredSuppliers.filter(supplier => 
                supplier.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        const response = {
            success: true,
            suppliers: filteredSuppliers,
            total_count: filteredSuppliers.length,
            filters_applied: {
                component_type: component_type || null,
                quality_rating_min: quality_rating_min || null,
                location: location || null
            },
            summary: {
                avg_quality_rating: (filteredSuppliers.reduce((sum, s) => sum + s.quality_rating, 0) / filteredSuppliers.length).toFixed(2),
                avg_delivery_rating: (filteredSuppliers.reduce((sum, s) => sum + s.delivery_rating, 0) / filteredSuppliers.length).toFixed(2),
                total_annual_value: filteredSuppliers.reduce((sum, s) => sum + s.annual_supply_value, 0)
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve supplier information'
        });
    }
});

// Get specific supplier details
app.get('/api/suppliers/:supplier_id', (req, res) => {
    try {
        const { supplier_id } = req.params;
        
        const supplier = suppliers.find(s => s.supplier_id === supplier_id);
        
        if (!supplier) {
            return res.status(404).json({
                success: false,
                error: 'Supplier not found',
                message: `Supplier with ID '${supplier_id}' does not exist`
            });
        }

        // Get procurement history for this supplier
        const supplierProcurements = procurementHistory.filter(p => p.supplier_id === supplier_id);
        
        const response = {
            success: true,
            supplier: supplier,
            procurement_history: supplierProcurements,
            performance_metrics: {
                total_orders: supplierProcurements.length,
                total_value: supplierProcurements.reduce((sum, p) => sum + p.total_cost, 0),
                on_time_delivery_rate: '94.5%',
                quality_pass_rate: '98.2%',
                last_order_date: supplierProcurements.length > 0 ? 
                    Math.max(...supplierProcurements.map(p => new Date(p.order_date))) : null
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching supplier details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve supplier details'
        });
    }
});

// Get procurement history
app.get('/api/procurement/history', (req, res) => {
    try {
        const { component_type, supplier_id, zone, status, limit = 50 } = req.query;

        let filteredHistory = procurementHistory.slice();

        // Apply filters
        if (component_type) {
            filteredHistory = filteredHistory.filter(p => 
                p.component_type.toUpperCase() === component_type.toUpperCase()
            );
        }

        if (supplier_id) {
            filteredHistory = filteredHistory.filter(p => p.supplier_id === supplier_id);
        }

        if (zone) {
            filteredHistory = filteredHistory.filter(p => 
                p.railway_zone.toLowerCase().includes(zone.toLowerCase())
            );
        }

        if (status) {
            filteredHistory = filteredHistory.filter(p => 
                p.status.toLowerCase() === status.toLowerCase()
            );
        }

        // Limit results
        const limitedHistory = filteredHistory.slice(0, parseInt(limit));

        const response = {
            success: true,
            procurement_history: limitedHistory,
            total_records: filteredHistory.length,
            returned_records: limitedHistory.length,
            summary: {
                total_value: filteredHistory.reduce((sum, p) => sum + p.total_cost, 0),
                avg_order_value: filteredHistory.length > 0 ? 
                    (filteredHistory.reduce((sum, p) => sum + p.total_cost, 0) / filteredHistory.length).toFixed(2) : 0,
                status_breakdown: {
                    delivered: filteredHistory.filter(p => p.status === 'Delivered').length,
                    in_transit: filteredHistory.filter(p => p.status === 'In Transit').length,
                    pending: filteredHistory.filter(p => p.status === 'Pending').length
                }
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching procurement history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve procurement history'
        });
    }
});

// Create new procurement order
app.post('/api/procurement/order', (req, res) => {
    try {
        const { 
            component_type, 
            quantity, 
            supplier_id, 
            railway_zone, 
            delivery_date,
            priority = 'Normal'
        } = req.body;

        // Validation
        if (!component_type || !quantity || !supplier_id || !railway_zone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['component_type', 'quantity', 'supplier_id', 'railway_zone']
            });
        }

        const componentType = component_type.toUpperCase();
        if (!inventory[componentType]) {
            return res.status(400).json({
                success: false,
                error: 'Invalid component type',
                available_types: Object.keys(inventory)
            });
        }

        const supplier = suppliers.find(s => s.supplier_id === supplier_id);
        if (!supplier) {
            return res.status(400).json({
                success: false,
                error: 'Invalid supplier ID'
            });
        }

        if (!supplier.specialization.includes(componentType)) {
            return res.status(400).json({
                success: false,
                error: 'Supplier does not supply this component type',
                supplier_specialization: supplier.specialization
            });
        }

        // Create procurement order
        const order = {
            po_number: `PO${new Date().getFullYear()}${String(Math.floor(Math.random() * 9999)).padStart(3, '0')}`,
            component_type: componentType,
            quantity: parseInt(quantity),
            unit_cost: inventory[componentType].unit_cost,
            total_cost: parseInt(quantity) * inventory[componentType].unit_cost,
            supplier_id: supplier_id,
            supplier_name: supplier.name,
            order_date: new Date().toISOString().split('T')[0],
            delivery_date: delivery_date || new Date(Date.now() + supplier.avg_lead_time_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Ordered',
            quality_inspection: 'Pending',
            railway_zone: railway_zone,
            priority: priority,
            created_at: new Date().toISOString(),
            estimated_delivery: supplier.avg_lead_time_days
        };

        // Add to procurement history (simulate database insert)
        procurementHistory.push(order);

        const response = {
            success: true,
            message: 'Procurement order created successfully',
            order: order,
            next_steps: [
                'Supplier will be notified automatically',
                'Quality inspection will be scheduled upon delivery',
                'Inventory will be updated after quality approval'
            ]
        };

        res.status(201).json(response);

    } catch (error) {
        console.error('Error creating procurement order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create procurement order'
        });
    }
});

// Get railway zones information
app.get('/api/zones', (req, res) => {
    try {
        const response = {
            success: true,
            railway_zones: railwayZones,
            total_zones: railwayZones.length,
            coverage: 'Pan-India'
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching railway zones:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve railway zones'
        });
    }
});

// Integration endpoint for Railway QR Tracker
app.post('/api/integration/component-scan', (req, res) => {
    try {
        const { qr_code, component_id, component_type, scanned_by, location } = req.body;

        if (!qr_code || !component_type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required_fields: ['qr_code', 'component_type']
            });
        }

        const componentType = component_type.toUpperCase();
        const inventoryData = inventory[componentType];

        if (!inventoryData) {
            return res.status(404).json({
                success: false,
                error: 'Component type not found in UDM inventory'
            });
        }

        // Simulate integration response
        const integrationResponse = {
            success: true,
            udm_reference: uuidv4(),
            component_verified: true,
            inventory_status: {
                component_type: componentType,
                available_stock: inventoryData.available,
                stock_status: inventoryData.available > inventoryData.total * 0.2 ? 'Normal' : 'Low',
                unit_cost: inventoryData.unit_cost,
                last_procurement: inventoryData.last_procurement_date
            },
            maintenance_recommendation: {
                next_inspection_due: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                maintenance_type: 'Routine',
                estimated_cost: inventoryData.unit_cost * 0.1
            },
            integration_timestamp: new Date().toISOString()
        };

        res.status(200).json(integrationResponse);

    } catch (error) {
        console.error('Error processing component scan integration:', error);
        res.status(500).json({
            success: false,
            error: 'Integration processing failed'
        });
    }
});

// Cost analysis endpoint
app.get('/api/analytics/cost-analysis', (req, res) => {
    try {
        const { period = 'annual', component_type } = req.query;

        // Calculate cost analytics
        const totalInventoryValue = Object.values(inventory).reduce((sum, item) => 
            sum + (item.total * item.unit_cost), 0
        );

        const procurementCosts = procurementHistory.reduce((sum, p) => sum + p.total_cost, 0);

        let analysisData = {
            total_inventory_value: totalInventoryValue,
            total_procurement_cost: procurementCosts,
            cost_per_component_type: {},
            supplier_cost_breakdown: {},
            zone_wise_distribution: {}
        };

        // Component type analysis
        Object.entries(inventory).forEach(([type, data]) => {
            if (!component_type || component_type.toUpperCase() === type) {
                analysisData.cost_per_component_type[type] = {
                    inventory_value: data.total * data.unit_cost,
                    unit_cost: data.unit_cost,
                    quantity: data.total,
                    percentage_of_total: ((data.total * data.unit_cost) / totalInventoryValue * 100).toFixed(2)
                };
            }
        });

        // Supplier cost breakdown
        suppliers.forEach(supplier => {
            const supplierProcurements = procurementHistory.filter(p => p.supplier_id === supplier.supplier_id);
            const supplierCost = supplierProcurements.reduce((sum, p) => sum + p.total_cost, 0);
            
            if (supplierCost > 0) {
                analysisData.supplier_cost_breakdown[supplier.name] = {
                    total_cost: supplierCost,
                    order_count: supplierProcurements.length,
                    avg_order_value: supplierProcurements.length > 0 ? supplierCost / supplierProcurements.length : 0,
                    percentage_of_total: (supplierCost / procurementCosts * 100).toFixed(2)
                };
            }
        });

        // Zone wise distribution
        railwayZones.forEach(zone => {
            const zoneProcurements = procurementHistory.filter(p => 
                p.railway_zone.toLowerCase().includes(zone.name.toLowerCase())
            );
            const zoneCost = zoneProcurements.reduce((sum, p) => sum + p.total_cost, 0);
            
            if (zoneCost > 0) {
                analysisData.zone_wise_distribution[zone.name] = {
                    total_cost: zoneCost,
                    order_count: zoneProcurements.length,
                    percentage_of_total: (zoneCost / procurementCosts * 100).toFixed(2)
                };
            }
        });

        const response = {
            success: true,
            analysis_period: period,
            cost_analysis: analysisData,
            optimization_recommendations: [
                'Consider bulk procurement to reduce unit costs',
                'Evaluate supplier performance for cost optimization',
                'Implement just-in-time inventory for high-value components',
                'Negotiate better rates with high-volume suppliers'
            ],
            generated_at: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error generating cost analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate cost analysis'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('UDM API Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred in UDM API',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `UDM API endpoint ${req.method} ${req.path} not found`,
        available_endpoints: [
            'GET /api/health',
            'GET /api/inventory/status/:type',
            'GET /api/inventory/overview',
            'POST /api/inventory/update',
            'GET /api/suppliers',
            'GET /api/suppliers/:supplier_id',
            'GET /api/procurement/history',
            'POST /api/procurement/order',
            'GET /api/zones',
            'POST /api/integration/component-scan',
            'GET /api/analytics/cost-analysis'
        ]
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log('🏢 UDM (Unified Data Management) API Server');
    console.log('============================================');
    console.log(`🚀 Server running on: http://localhost:${port}`);
    console.log(`🌐 Network access: http://0.0.0.0:${port}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
    console.log('');
    console.log('📋 Available Services:');
    console.log('   📦 Inventory Management');
    console.log('   🏭 Supplier Information');
    console.log('   📈 Procurement Tracking');
    console.log('   💰 Cost Analysis');
    console.log('   🔌 Railway QR Tracker Integration');
    console.log('');
    console.log('🚂 Simulating Indian Railways UDM System');
    console.log('🏆 Smart India Hackathon 2025 Ready!');
});

module.exports = app;
