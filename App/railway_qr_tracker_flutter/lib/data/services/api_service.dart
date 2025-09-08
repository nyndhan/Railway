import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../core/constants/api_constants.dart';
import '../models/component_model.dart';

class ApiService {
  late final Dio _dio;

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(milliseconds: ApiConstants.connectTimeout),
      receiveTimeout: const Duration(milliseconds: ApiConstants.receiveTimeout),
      headers: ApiConstants.defaultHeaders,
    ));

    // Add logging interceptor
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print('API: $obj'),
    ));
  }

  // Check network connectivity
  Future<bool> isConnected() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  // Health check
  Future<bool> checkHealth() async {
    try {
      final response = await _dio.get(ApiConstants.health);
      return response.statusCode == 200;
    } catch (e) {
      print('Health check failed: $e');
      return false;
    }
  }

  // Decode QR code
  Future<ComponentModel?> decodeQR(String qrCode) async {
    try {
      final endpoint = ApiConstants.decodeQr.replaceAll('{qrCode}', qrCode);
      final response = await _dio.get(endpoint);

      if (response.statusCode == 200) {
        return ComponentModel.fromJson(response.data);
      }
      return null;
    } on DioException catch (e) {
      print('QR decode error: ${e.message}');
      return null;
    }
  }

  // Record scan
  Future<bool> recordScan({
    required String qrCode,
    required String scannedBy,
    required String location,
    Map<String, dynamic>? deviceInfo,
  }) async {
    try {
      final data = {
        'qrCode': qrCode,
        'scannedBy': scannedBy,
        'location': location,
        'deviceInfo': deviceInfo,
      };

      final response = await _dio.post(ApiConstants.recordScan, data: data);
      return response.statusCode == 200;
    } on DioException catch (e) {
      print('Record scan error: ${e.message}');
      return false;
    }
  }

  // Generate QR code
  Future<Map<String, dynamic>?> generateQR({
    required String componentType,
    required String manufacturer,
    required String batchNumber,
    String? manufacturingDate,
    String? trackSection,
    double? kmPost,
  }) async {
    try {
      final data = {
        'component_type': componentType,
        'manufacturer': manufacturer,
        'batch_number': batchNumber,
        if (manufacturingDate != null) 'manufacturing_date': manufacturingDate,
        if (trackSection != null) 'track_section': trackSection,
        if (kmPost != null) 'km_post': kmPost,
      };

      final response = await _dio.post(ApiConstants.generateQr, data: data);

      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } on DioException catch (e) {
      print('QR generation error: ${e.message}');
      return null;
    }
  }

  // Get components
  Future<List<ComponentModel>> getComponents() async {
    try {
      final response = await _dio.get(ApiConstants.components);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => ComponentModel.fromJson(json)).toList();
      }
      return [];
    } on DioException catch (e) {
      print('Get components error: ${e.message}');
      return [];
    }
  }

  // Get single component
  Future<ComponentModel?> getComponent(String componentId) async {
    try {
      final endpoint = ApiConstants.component.replaceAll('{id}', componentId);
      final response = await _dio.get(endpoint);

      if (response.statusCode == 200) {
        return ComponentModel.fromJson(response.data);
      }
      return null;
    } on DioException catch (e) {
      print('Get component error: ${e.message}');
      return null;
    }
  }

  // Generate mock component data for offline use
  ComponentModel generateMockComponent(String qrCode) {
    return ComponentModel(
      componentId: qrCode.substring(0, 10),
      qrCode: qrCode,
      componentType: 'ERC',
      manufacturer: 'Mock Manufacturer',
      batchNumber: 'MOCK_BATCH',
      trackSection: 'DEMO-TRACK',
      kmPost: 123.456,
      status: 'Active',
      warrantyMonths: 24,
      scanCount: 1,
      lastScanned: DateTime.now().toIso8601String(),
    );
  }
}
