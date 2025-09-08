import 'package:equatable/equatable.dart';

class ScanModel extends Equatable {
  final String id;
  final String qrCode;
  final String componentId;
  final String timestamp;
  final String location;
  final Map<String, dynamic>? deviceInfo;
  final Map<String, dynamic>? componentData;
  final String? error;

  const ScanModel({
    required this.id,
    required this.qrCode,
    required this.componentId,
    required this.timestamp,
    required this.location,
    this.deviceInfo,
    this.componentData,
    this.error,
  });

  factory ScanModel.fromJson(Map<String, dynamic> json) {
    return ScanModel(
      id: json['id'] ?? '',
      qrCode: json['qrCode'] ?? json['qr_code'] ?? '',
      componentId: json['componentId'] ?? json['component_id'] ?? '',
      timestamp: json['timestamp'] ?? '',
      location: json['location'] ?? '',
      deviceInfo: json['deviceInfo'] ?? json['device_info'],
      componentData: json['componentData'] ?? json['component_data'],
      error: json['error'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'qrCode': qrCode,
      'componentId': componentId,
      'timestamp': timestamp,
      'location': location,
      'deviceInfo': deviceInfo,
      'componentData': componentData,
      'error': error,
    };
  }

  bool get hasError => error != null && error!.isNotEmpty;

  String get formattedTime {
    try {
      final scanTime = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(scanTime);

      if (difference.inMinutes < 1) {
        return 'Just now';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inHours < 24) {
        return '${difference.inHours}h ago';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}d ago';
      } else {
        return '${scanTime.day}/${scanTime.month}/${scanTime.year}';
      }
    } catch (e) {
      return 'Unknown';
    }
  }

  @override
  List<Object?> get props => [
        id,
        qrCode,
        componentId,
        timestamp,
        location,
        deviceInfo,
        componentData,
        error,
      ];
}
