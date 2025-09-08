import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/scan/scan_screen.dart';
import '../screens/component/component_detail_screen.dart';
import '../screens/history/history_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/splash/splash_screen.dart';
import '../../data/models/component_model.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Bottom Navigation Shell
      ShellRoute(
        builder: (context, state, child) {
          return ScaffoldWithNavBar(child: child);
        },
        routes: [
          // Scan Screen (Home)
          GoRoute(
            path: '/',
            builder: (context, state) => const ScanScreen(),
          ),

          // History Screen
          GoRoute(
            path: '/history',
            builder: (context, state) => const HistoryScreen(),
          ),

          // Settings Screen
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),

      // Component Details Screen
      GoRoute(
        path: '/component-details',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          final componentData = extra['component'];
          final scanTime = extra['scanTime'] as String;

          ComponentModel component;

          // Handle both ComponentModel and Map data
          if (componentData is ComponentModel) {
            component = componentData;
          } else {
            // Convert from Map to ComponentModel
            component = ComponentModel.fromJson(componentData as Map<String, dynamic>);
          }

          return ComponentDetailScreen(
            component: component,
            scanTime: scanTime,
          );
        },
      ),
    ],

    // Error handling
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: ${state.error}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
}

// Custom scaffold with bottom navigation
class ScaffoldWithNavBar extends StatelessWidget {
  final Widget child;

  const ScaffoldWithNavBar({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _calculateSelectedIndex(context),
        onTap: (index) => _onItemTapped(index, context),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner),
            label: 'Scan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;

    if (location == '/') return 0;
    if (location == '/history') return 1;
    if (location == '/settings') return 2;

    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/history');
        break;
      case 2:
        context.go('/settings');
        break;
    }
  }
}
