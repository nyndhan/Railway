import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../providers/scan_provider.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/loading_widget.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  late MobileScannerController _controller;
  bool _isFlashOn = false;
  bool _hasScanned = false;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      facing: CameraFacing.back,
      torchEnabled: false,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScanProvider>().initialize();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_hasScanned) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? qrCode = barcodes.first.rawValue;
    if (qrCode == null || qrCode.isEmpty) return;

    setState(() {
      _hasScanned = true;
    });

    context.read<ScanProvider>().stopScanning();

    try {
      final component = await context.read<ScanProvider>().processScan(qrCode);

      if (component != null && mounted) {
        context.push('/component-details', extra: {
          'component': component,
          'scanTime': DateTime.now().toIso8601String(),
        });
      } else if (mounted) {
        _showErrorDialog('Failed to process QR code');
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('Scan processing failed: $e');
      }
    }

    // Reset scan state after delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _hasScanned = false;
        });
        context.read<ScanProvider>().startScanning();
      }
    });
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error, color: AppColors.error),
            SizedBox(width: 8),
            Text('Scan Error'),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _toggleFlash() async {
    await _controller.toggleTorch();
    setState(() {
      _isFlashOn = !_isFlashOn;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.scanTitle),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Consumer<ScanProvider>(
        builder: (context, scanProvider, _) {
          return Column(
            children: [
              // Header Information
              Container(
                width: double.infinity,
                color: Colors.white,
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text(
                      AppStrings.scanSubtitle,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '📱 Total Scans: ${scanProvider.scanCount}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              // Scanner View
              Expanded(
                child: Stack(
                  children: [
                    // Camera View
                    MobileScanner(
                      controller: _controller,
                      onDetect: _hasScanned ? null : _onDetect,
                    ),

                    // Overlay with scanning frame
                    Container(
                      decoration: const BoxDecoration(
                        color: AppColors.scannerOverlay,
                      ),
                      child: Center(
                        child: Container(
                          width: 250,
                          height: 250,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: AppColors.scannerFrame,
                              width: 3,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),

                    // Processing Overlay
                    if (scanProvider.isProcessing)
                      Container(
                        color: Colors.black.withOpacity(0.8),
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              LoadingWidget(color: Colors.white),
                              SizedBox(height: 16),
                              Text(
                                AppStrings.processing,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // Controls
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        onPressed: _toggleFlash,
                        text: _isFlashOn ? AppStrings.flashOn : AppStrings.flashOff,
                        backgroundColor: _isFlashOn ? AppColors.primary : AppColors.textSecondary,
                        icon: Icons.flash_on,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: CustomButton(
                        onPressed: () => context.push('/history'),
                        text: '${AppStrings.viewHistory} (${scanProvider.scanCount})',
                        backgroundColor: AppColors.success,
                        icon: Icons.history,
                      ),
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
