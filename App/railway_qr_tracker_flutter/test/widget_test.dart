import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:railway_qr_tracker_flutter/main.dart';

void main() {
  testWidgets('Railway QR Tracker smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const RailwayQRTrackerApp());

    // Verify that the app starts with splash screen or main content
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
