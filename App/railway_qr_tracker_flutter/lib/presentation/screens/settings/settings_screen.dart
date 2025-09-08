import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../providers/settings_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SettingsProvider>().initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.settingsTitle),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer<SettingsProvider>(
        builder: (context, settingsProvider, _) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // App Settings Card
              Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text(
                        AppStrings.appSettings,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    SwitchListTile(
                      title: const Text('Auto Sync'),
                      subtitle: const Text('Automatically sync scan data when online'),
                      value: settingsProvider.autoSync,
                      onChanged: (value) => settingsProvider.toggleSetting('autoSync'),
                      activeColor: AppColors.primary,
                    ),
                    SwitchListTile(
                      title: const Text('Vibration'),
                      subtitle: const Text('Vibrate on successful scan'),
                      value: settingsProvider.vibration,
                      onChanged: (value) => settingsProvider.toggleSetting('vibration'),
                      activeColor: AppColors.primary,
                    ),
                    SwitchListTile(
                      title: const Text('Sound Feedback'),
                      subtitle: const Text('Play sound when scanning QR codes'),
                      value: settingsProvider.sound,
                      onChanged: (value) => settingsProvider.toggleSetting('sound'),
                      activeColor: AppColors.primary,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // App Information Card
              Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text(
                        '📊 App Information',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    ListTile(
                      title: const Text('Version'),
                      trailing: Text('${settingsProvider.version} (${settingsProvider.buildNumber})'),
                    ),
                    ListTile(
                      title: const Text('Storage Used'),
                      trailing: Text(settingsProvider.storageSize),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Actions Card
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.info, color: AppColors.info),
                      title: const Text(AppStrings.aboutApp),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('About Railway QR Tracker'),
                            content: Text('Version ${settingsProvider.version}\n\nDeveloped for Smart India Hackathon 2025'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text('OK'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
