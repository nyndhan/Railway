import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../data/services/storage_service.dart';

class SettingsProvider extends ChangeNotifier {
  final StorageService _storageService = StorageService();

  Map<String, dynamic> _settings = {};
  bool _isLoading = false;
  String? _errorMessage;
  String _version = '1.0.0';
  String _buildNumber = '1';
  String _storageSize = '0 KB';

  // Getters
  Map<String, dynamic> get settings => _settings;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get version => _version;
  String get buildNumber => _buildNumber;
  String get storageSize => _storageSize;

  // Individual setting getters
  bool get autoSync => _settings['autoSync'] ?? true;
  bool get vibration => _settings['vibration'] ?? true;
  bool get sound => _settings['sound'] ?? true;
  bool get offlineMode => _settings['offlineMode'] ?? false;

  // Initialize settings
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      await loadSettings();
      await loadAppInfo();
      await loadStorageInfo();
    } catch (e) {
      _errorMessage = 'Failed to load settings: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Load settings from storage
  Future<void> loadSettings() async {
    try {
      _settings = await _storageService.getSettings();
    } catch (e) {
      _settings = {
        'autoSync': true,
        'vibration': true,
        'sound': true,
        'offlineMode': false,
      };
    }
    notifyListeners();
  }

  // Save settings to storage
  Future<void> saveSettings() async {
    try {
      await _storageService.saveSettings(_settings);
    } catch (e) {
      _errorMessage = 'Failed to save settings: $e';
      notifyListeners();
    }
  }

  // Update individual setting
  Future<void> updateSetting(String key, dynamic value) async {
    _settings[key] = value;
    notifyListeners();
    await saveSettings();
  }

  // Toggle boolean setting
  Future<void> toggleSetting(String key) async {
    final currentValue = _settings[key] ?? false;
    await updateSetting(key, !currentValue);
  }

  // Load app information
  Future<void> loadAppInfo() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      _version = packageInfo.version;
      _buildNumber = packageInfo.buildNumber;
    } catch (e) {
      print('Failed to load app info: $e');
    }
    notifyListeners();
  }

  // Load storage information
  Future<void> loadStorageInfo() async {
    try {
      _storageSize = await _storageService.getStorageSize();
    } catch (e) {
      _storageSize = 'Unknown';
    }
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
