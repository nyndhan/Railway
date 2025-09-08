import 'package:flutter/foundation.dart';
import '../data/services/api_service.dart';
import '../data/services/storage_service.dart';

class AppStateProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  bool _isOnline = false;
  bool _isInitialized = false;
  String? _errorMessage;

  // Getters
  bool get isOnline => _isOnline;
  bool get isInitialized => _isInitialized;
  String? get errorMessage => _errorMessage;

  // Initialize app state
  Future<void> initialize() async {
    try {
      await _storageService.init();
      await _checkConnectivity();
      _isInitialized = true;
      _errorMessage = null;
    } catch (e) {
      _errorMessage = 'Failed to initialize app: $e';
      _isInitialized = true; // Still mark as initialized to show error
    }
    notifyListeners();
  }

  // Check connectivity
  Future<void> _checkConnectivity() async {
    try {
      _isOnline = await _apiService.isConnected() && await _apiService.checkHealth();
    } catch (e) {
      _isOnline = false;
    }
    notifyListeners();
  }

  // Refresh connectivity
  Future<void> refreshConnectivity() async {
    await _checkConnectivity();
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Set error
  void setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }
}
