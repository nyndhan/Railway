import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import 'package:vibration/vibration.dart';
import '../data/models/component_model.dart';
import '../data/models/scan_model.dart';
import '../data/services/api_service.dart';
import '../data/services/storage_service.dart';

class ScanProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  final Uuid _uuid = const Uuid();

  bool _isScanning = false;
  bool _isProcessing = false;
  ComponentModel? _lastScannedComponent;
  List<ScanModel> _scanHistory = [];
  String? _errorMessage;

  // Getters
  bool get isScanning => _isScanning;
  bool get isProcessing => _isProcessing;
  ComponentModel? get lastScannedComponent => _lastScannedComponent;
  List<ScanModel> get scanHistory => _scanHistory;
  String? get errorMessage => _errorMessage;
  int get scanCount => _scanHistory.length;

  // Initialize scan provider
  Future<void> initialize() async {
    await loadScanHistory();
  }

  // Start scanning
  void startScanning() {
    _isScanning = true;
    _errorMessage = null;
    notifyListeners();
  }

  // Stop scanning
  void stopScanning() {
    _isScanning = false;
    notifyListeners();
  }

  // Process QR code scan
  Future<ComponentModel?> processScan(String qrCode) async {
    if (_isProcessing) return null;

    _isProcessing = true;
    _errorMessage = null;
    notifyListeners();

    try {
      ComponentModel? component;

      // Try to get component from API
      if (await _apiService.isConnected()) {
        component = await _apiService.decodeQR(qrCode);

        // Record scan on server
        if (component != null) {
          await _apiService.recordScan(
            qrCode: qrCode,
            scannedBy: 'mobile_user',
            location: 'Field Location',
            deviceInfo: {
              'platform': 'flutter',
              'timestamp': DateTime.now().toIso8601String(),
            },
          );
        }
      }

      // Fallback to mock data if API fails
      component ??= _apiService.generateMockComponent(qrCode);

      // Save scan to local history
      final scan = ScanModel(
        id: _uuid.v4(),
        qrCode: qrCode,
        componentId: component.componentId,
        timestamp: DateTime.now().toIso8601String(),
        location: 'Current Location',
        componentData: component.toJson(),
      );

      await _storageService.saveScanToHistory(scan);
      await loadScanHistory();

      _lastScannedComponent = component;

      // Vibrate on successful scan
      if (await Vibration.hasVibrator() ?? false) {
        Vibration.vibrate(duration: 100);
      }

      return component;
    } catch (e) {
      _errorMessage = 'Failed to process scan: $e';

      // Save error scan to history
      final errorScan = ScanModel(
        id: _uuid.v4(),
        qrCode: qrCode,
        componentId: 'Unknown',
        timestamp: DateTime.now().toIso8601String(),
        location: 'Current Location',
        error: e.toString(),
      );

      await _storageService.saveScanToHistory(errorScan);
      await loadScanHistory();

      return null;
    } finally {
      _isProcessing = false;
      notifyListeners();
    }
  }

  // Load scan history
  Future<void> loadScanHistory() async {
    try {
      _scanHistory = await _storageService.getScanHistory();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Failed to load scan history: $e';
      notifyListeners();
    }
  }

  // Clear scan history
  Future<void> clearScanHistory() async {
    try {
      await _storageService.clearScanHistory();
      _scanHistory.clear();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Failed to clear scan history: $e';
      notifyListeners();
    }
  }

  // Get scan by ID
  ScanModel? getScanById(String id) {
    try {
      return _scanHistory.firstWhere((scan) => scan.id == id);
    } catch (e) {
      return null;
    }
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
