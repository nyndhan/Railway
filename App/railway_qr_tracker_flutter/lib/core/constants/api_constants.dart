class ApiConstants {
  // Base URLs
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  static const String baseUrlDevice = 'http://192.168.1.100:3000/api'; // Replace with your IP

  // Endpoints
  static const String health = '/health';
  static const String generateQr = '/qr/generate';
  static const String decodeQr = '/qr/{qrCode}/decode';
  static const String recordScan = '/qr/scan';
  static const String components = '/components';
  static const String component = '/components/{id}';
  static const String analytics = '/analytics/dashboard';

  // Headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Timeouts
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds

  // HTTP Status Codes
  static const int statusOk = 200;
  static const int statusCreated = 201;
  static const int statusBadRequest = 400;
  static const int statusUnauthorized = 401;
  static const int statusNotFound = 404;
  static const int statusServerError = 500;
}
