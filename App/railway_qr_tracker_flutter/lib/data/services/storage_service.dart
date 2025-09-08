import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/scan_model.dart';
import '../models/component_model.dart';

class StorageService {
  static const String _scanHistoryKey = 'scan_history';
  static const String _settingsKey = 'app_settings';
  static const String _componentsKey = 'cached_components';

  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // Scan History Management
  Future<List<ScanModel>> getScanHistory() async {
    await init();
    final String? historyJson = _prefs?.getString(_scanHistoryKey);
    if (historyJson == null) return [];

    try {
      final List<dynamic> historyList = jsonDecode(historyJson);
      return historyList.map((json) => ScanModel.fromJson(json)).toList();
    } catch (e) {
      print('Error loading scan history: $e');
      return [];
    }
  }

  Future<bool> saveScanToHistory(ScanModel scan) async {
    try {
      final history = await getScanHistory();
      history.insert(0, scan); // Add to beginning

      // Keep only last 100 scans
      if (history.length > 100) {
        history.removeRange(100, history.length);
      }

      await init();
      final String historyJson = jsonEncode(history.map((e) => e.toJson()).toList());
      return _prefs?.setString(_scanHistoryKey, historyJson) ?? false;
    } catch (e) {
      print('Error saving scan: $e');
      return false;
    }
  }

  Future<bool> clearScanHistory() async {
    await init();
    return _prefs?.remove(_scanHistoryKey) ?? false;
  }

  Future<int> getScanCount() async {
    final history = await getScanHistory();
    return history.length;
  }

  // Settings Management
  Future<Map<String, dynamic>> getSettings() async {
    await init();
    final String? settingsJson = _prefs?.getString(_settingsKey);
    if (settingsJson == null) {
      return {
        'autoSync': true,
        'vibration': true,
        'sound': true,
        'offlineMode': false,
      };
    }

    try {
      return jsonDecode(settingsJson);
    } catch (e) {
      print('Error loading settings: $e');
      return {
        'autoSync': true,
        'vibration': true,
        'sound': true,
        'offlineMode': false,
      };
    }
  }

  Future<bool> saveSettings(Map<String, dynamic> settings) async {
    try {
      await init();
      final String settingsJson = jsonEncode(settings);
      return _prefs?.setString(_settingsKey, settingsJson) ?? false;
    } catch (e) {
      print('Error saving settings: $e');
      return false;
    }
  }

  // Component Cache Management
  Future<List<ComponentModel>> getCachedComponents() async {
    await init();
    final String? componentsJson = _prefs?.getString(_componentsKey);
    if (componentsJson == null) return [];

    try {
      final List<dynamic> componentsList = jsonDecode(componentsJson);
      return componentsList.map((json) => ComponentModel.fromJson(json)).toList();
    } catch (e) {
      print('Error loading cached components: $e');
      return [];
    }
  }

  Future<bool> cacheComponents(List<ComponentModel> components) async {
    try {
      await init();
      final String componentsJson = jsonEncode(components.map((e) => e.toJson()).toList());
      return _prefs?.setString(_componentsKey, componentsJson) ?? false;
    } catch (e) {
      print('Error caching components: $e');
      return false;
    }
  }

  // Clear all data
  Future<bool> clearAllData() async {
    try {
      await init();
      await _prefs?.clear();
      return true;
    } catch (e) {
      print('Error clearing data: $e');
      return false;
    }
  }

  // Get storage size (approximate)
  Future<String> getStorageSize() async {
    await init();
    int totalSize = 0;

    final keys = _prefs?.getKeys() ?? <String>{};
    for (String key in keys) {
      final value = _prefs?.get(key);
      if (value != null) {
        totalSize += value.toString().length;
      }
    }

    if (totalSize > 1024) {
      return '${(totalSize / 1024).toStringAsFixed(1)} KB';
    } else {
      return '$totalSize bytes';
    }
  }
}
