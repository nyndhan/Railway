import 'package:equatable/equatable.dart';

class ComponentModel extends Equatable {
  final String componentId;
  final String qrCode;
  final String componentType;
  final String manufacturer;
  final String batchNumber;
  final String? manufacturingDate;
  final String? installationDate;
  final String? trackSection;
  final double? kmPost;
  final int warrantyMonths;
  final String status;
  final int scanCount;
  final String? lastScanned;
  final String? createdAt;
  final String? updatedAt;

  const ComponentModel({
    required this.componentId,
    required this.qrCode,
    required this.componentType,
    required this.manufacturer,
    required this.batchNumber,
    this.manufacturingDate,
    this.installationDate,
    this.trackSection,
    this.kmPost,
    this.warrantyMonths = 24,
    this.status = 'Active',
    this.scanCount = 0,
    this.lastScanned,
    this.createdAt,
    this.updatedAt,
  });

  factory ComponentModel.fromJson(Map<String, dynamic> json) {
    return ComponentModel(
      componentId: json['componentId'] ?? json['component_id'] ?? '',
      qrCode: json['qrCode'] ?? json['qr_code'] ?? '',
      componentType: json['componentType'] ?? json['component_type'] ?? '',
      manufacturer: json['manufacturer'] ?? '',
      batchNumber: json['batchNumber'] ?? json['batch_number'] ?? '',
      manufacturingDate: json['manufacturingDate'] ?? json['manufacturing_date'],
      installationDate: json['installationDate'] ?? json['installation_date'],
      trackSection: json['trackSection'] ?? json['track_section'],
      kmPost: (json['kmPost'] ?? json['km_post'])?.toDouble(),
      warrantyMonths: json['warrantyMonths'] ?? json['warranty_months'] ?? 24,
      status: json['status'] ?? 'Active',
      scanCount: json['scanCount'] ?? json['scan_count'] ?? 0,
      lastScanned: json['lastScanned'] ?? json['last_scanned'],
      createdAt: json['createdAt'] ?? json['created_at'],
      updatedAt: json['updatedAt'] ?? json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'componentId': componentId,
      'qrCode': qrCode,
      'componentType': componentType,
      'manufacturer': manufacturer,
      'batchNumber': batchNumber,
      'manufacturingDate': manufacturingDate,
      'installationDate': installationDate,
      'trackSection': trackSection,
      'kmPost': kmPost,
      'warrantyMonths': warrantyMonths,
      'status': status,
      'scanCount': scanCount,
      'lastScanned': lastScanned,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  String get componentTypeLabel {
    switch (componentType) {
      case 'ERC':
        return 'Elastic Rail Clip';
      case 'RPD':
        return 'Rail Pad';
      case 'LNR':
        return 'Liner';
      default:
        return componentType;
    }
  }

  String get statusEmoji {
    switch (status.toLowerCase()) {
      case 'active':
        return '🟢';
      case 'inactive':
        return '🔴';
      case 'replaced':
        return '🟡';
      case 'damaged':
        return '⚠️';
      default:
        return '⚪';
    }
  }

  ComponentModel copyWith({
    String? componentId,
    String? qrCode,
    String? componentType,
    String? manufacturer,
    String? batchNumber,
    String? manufacturingDate,
    String? installationDate,
    String? trackSection,
    double? kmPost,
    int? warrantyMonths,
    String? status,
    int? scanCount,
    String? lastScanned,
    String? createdAt,
    String? updatedAt,
  }) {
    return ComponentModel(
      componentId: componentId ?? this.componentId,
      qrCode: qrCode ?? this.qrCode,
      componentType: componentType ?? this.componentType,
      manufacturer: manufacturer ?? this.manufacturer,
      batchNumber: batchNumber ?? this.batchNumber,
      manufacturingDate: manufacturingDate ?? this.manufacturingDate,
      installationDate: installationDate ?? this.installationDate,
      trackSection: trackSection ?? this.trackSection,
      kmPost: kmPost ?? this.kmPost,
      warrantyMonths: warrantyMonths ?? this.warrantyMonths,
      status: status ?? this.status,
      scanCount: scanCount ?? this.scanCount,
      lastScanned: lastScanned ?? this.lastScanned,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        componentId,
        qrCode,
        componentType,
        manufacturer,
        batchNumber,
        manufacturingDate,
        installationDate,
        trackSection,
        kmPost,
        warrantyMonths,
        status,
        scanCount,
        lastScanned,
        createdAt,
        updatedAt,
      ];
}
