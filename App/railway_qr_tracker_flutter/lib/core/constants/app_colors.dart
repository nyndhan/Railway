import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFFFF6B35);
  static const Color primaryDark = Color(0xFFE55A2B);
  static const Color primaryLight = Color(0xFFFFE0D6);

  // Secondary Colors
  static const Color secondary = Color(0xFF4ECDC4);
  static const Color accent = Color(0xFF45B7D1);

  // Status Colors
  static const Color success = Color(0xFF28A745);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFDC3545);
  static const Color info = Color(0xFF17A2B8);

  // Component Status Colors
  static const Color statusActive = Color(0xFF28A745);
  static const Color statusInactive = Color(0xFFDC3545);
  static const Color statusReplaced = Color(0xFFFFC107);
  static const Color statusDamaged = Color(0xFFDC3545);

  // Neutral Colors
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE9ECEF);
  static const Color divider = Color(0xFFF1F3F4);

  // Text Colors
  static const Color textPrimary = Color(0xFF343A40);
  static const Color textSecondary = Color(0xFF6C757D);
  static const Color textLight = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // QR Scanner Colors
  static const Color scannerOverlay = Color(0x80000000);
  static const Color scannerFrame = Color(0xFFFF6B35);

  // Material Swatch for Theme
  static const MaterialColor primarySwatch = MaterialColor(
    0xFFFF6B35,
    <int, Color>{
      50: Color(0xFFFFF5F0),
      100: Color(0xFFFFE0D6),
      200: Color(0xFFFFCCB3),
      300: Color(0xFFFFB390),
      400: Color(0xFFFF8F6D),
      500: Color(0xFFFF6B35),
      600: Color(0xFFE55A2B),
      700: Color(0xFFCC4921),
      800: Color(0xFFB33817),
      900: Color(0xFF99270D),
    },
  );
}
