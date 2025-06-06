import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:local_auth/local_auth.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'core/config/app_config.dart';
import 'core/services/emergency_service.dart';
import 'core/services/location_service.dart';
import 'core/services/voice_service.dart';
import 'core/services/background_service.dart';
import 'core/utils/security_utils.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/app_localizations.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/emergency/bloc/emergency_bloc.dart';
import 'features/location/bloc/location_bloc.dart';
import 'features/settings/bloc/settings_bloc.dart';

/// Background message handler for Firebase
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  
  // Handle emergency notifications in background
  if (message.data['type'] == 'emergency') {
    final emergencyService = EmergencyService();
    await emergencyService.handleBackgroundEmergencyAlert(message.data);
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Configure system UI
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Sentry for error tracking
  await SentryFlutter.init(
    (options) {
      options.dsn = AppConfig.sentryDsn;
      options.environment = AppConfig.environment;
      options.debug = AppConfig.isDebug;
    },
    appRunner: () => _initializeApp(),
  );
}

Future<void> _initializeApp() async {
  try {
    // Initialize Firebase
    await Firebase.initializeApp();
    
    // Set up background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Initialize Hive for local storage
    await Hive.initFlutter();
    await Hive.openBox('settings');
    await Hive.openBox('emergency_contacts');
    await Hive.openBox('safe_locations');

    // Initialize background service for emergency monitoring
    await initializeBackgroundService();

    // Request critical permissions
    await _requestPermissions();

    // Initialize emergency gesture detection
    await _initializeEmergencyGestureDetection();

    // Start the app
    runApp(SafeMapApp());

  } catch (error, stackTrace) {
    // Report initialization errors to Sentry
    await Sentry.captureException(error, stackTrace: stackTrace);
    
    // Run app anyway with error handling
    runApp(SafeMapErrorApp(error: error.toString()));
  }
}

class SafeMapApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthBloc()..add(AuthCheckRequested())),
        BlocProvider(create: (_) => EmergencyBloc()),
        BlocProvider(create: (_) => LocationBloc()..add(LocationInitialized())),
        BlocProvider(create: (_) => SettingsBloc()..add(SettingsLoaded())),
      ],
      child: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, settingsState) {
          return MaterialApp.router(
            title: 'Safe Map',
            debugShowCheckedModeBanner: false,
            
            // Theme configuration
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: settingsState.themeMode,
            
            // Localization configuration
            locale: settingsState.locale,
            supportedLocales: AppLocalizations.supportedLocales,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            
            // Router configuration
            routerConfig: AppRouter.router,
            
            // Builder for emergency overlay
            builder: (context, child) {
              return MediaQuery(
                data: MediaQuery.of(context).copyWith(textScaleFactor: 1.0),
                child: EmergencyOverlay(child: child!),
              );
            },
          );
        },
      ),
    );
  }
}

/// Error app displayed when initialization fails
class SafeMapErrorApp extends StatelessWidget {
  final String error;

  const SafeMapErrorApp({Key? key, required this.error}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Safe Map - Error',
      home: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  'Safe Map Failed to Start',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'For emergency assistance, please call 112 directly.',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => _callEmergency(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  child: Text('Call 112 Emergency', style: TextStyle(fontSize: 18)),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => _restartApp(),
                  child: Text('Restart App'),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: SingleChildScrollView(
                    child: Text(
                      'Error Details:\n$error',
                      style: TextStyle(fontSize: 12, fontFamily: 'monospace'),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _callEmergency() async {
    // Implementation would use url_launcher to call 112
  }

  void _restartApp() async {
    // Implementation would restart the app or navigate to retry initialization
  }
}

/// Emergency overlay widget for panic button and gesture detection
class EmergencyOverlay extends StatefulWidget {
  final Widget child;

  const EmergencyOverlay({Key? key, required this.child}) : super(key: key);

  @override
  State<EmergencyOverlay> createState() => _EmergencyOverlayState();
}

class _EmergencyOverlayState extends State<EmergencyOverlay> {
  bool _showPanicButton = true;
  bool _stealthMode = false;

  @override
  void initState() {
    super.initState();
    _listenToEmergencyState();
  }

  void _listenToEmergencyState() {
    // Listen to emergency bloc state changes
    context.read<EmergencyBloc>().stream.listen((state) {
      if (state is EmergencyActivated && state.stealthMode) {
        setState(() {
          _stealthMode = true;
          _showPanicButton = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        
        // Stealth mode overlay (calculator UI)
        if (_stealthMode) StealthModeOverlay(),
        
        // Emergency panic button
        if (_showPanicButton && !_stealthMode)
          Positioned(
            bottom: 100,
            right: 16,
            child: EmergencyPanicButton(),
          ),
      ],
    );
  }
}

/// Stealth mode overlay showing calculator interface
class StealthModeOverlay extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black87,
      child: SafeArea(
        child: Column(
          children: [
            // Calculator header
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Text(
                    'Calculator',
                    style: TextStyle(color: Colors.white, fontSize: 20),
                  ),
                  Spacer(),
                  IconButton(
                    icon: Icon(Icons.close, color: Colors.white),
                    onPressed: () {
                      context.read<EmergencyBloc>().add(EmergencyResolved());
                    },
                  ),
                ],
              ),
            ),
            
            // Calculator display
            Expanded(
              flex: 2,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                alignment: Alignment.bottomRight,
                child: Text(
                  'Emergency mode active\nHelp is on the way',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ),
            
            // Calculator buttons (fake)
            Expanded(
              flex: 3,
              child: GridView.count(
                crossAxisCount: 4,
                children: [
                  '7', '8', '9', '÷',
                  '4', '5', '6', '×',
                  '1', '2', '3', '-',
                  '0', '.', '=', '+',
                ].map((text) => CalculatorButton(text: text)).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Calculator button for stealth mode
class CalculatorButton extends StatelessWidget {
  final String text;

  const CalculatorButton({Key? key, required this.text}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(4),
      child: ElevatedButton(
        onPressed: () {
          // Fake calculator functionality
          HapticFeedback.lightImpact();
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.grey[800],
          foregroundColor: Colors.white,
        ),
        child: Text(text, style: TextStyle(fontSize: 20)),
      ),
    );
  }
}

/// Emergency panic button widget
class EmergencyPanicButton extends StatefulWidget {
  @override
  State<EmergencyPanicButton> createState() => _EmergencyPanicButtonState();
}

class _EmergencyPanicButtonState extends State<EmergencyPanicButton>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _pulseAnimation.value,
          child: GestureDetector(
            onTap: _triggerEmergency,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.red.withOpacity(0.5),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Icon(
                Icons.warning,
                color: Colors.white,
                size: 40,
              ),
            ),
          ),
        );
      },
    );
  }

  void _triggerEmergency() async {
    // Haptic feedback
    HapticFeedback.heavyImpact();
    
    // Trigger emergency
    context.read<EmergencyBloc>().add(EmergencyTriggered(
      type: EmergencyType.panicButton,
      metadata: {'triggered_at': DateTime.now().toIso8601String()},
    ));
  }
}

/// Request critical permissions for emergency features
Future<void> _requestPermissions() async {
  final permissions = [
    Permission.location,
    Permission.locationAlways,
    Permission.camera,
    Permission.microphone,
    Permission.phone,
    Permission.sms,
    Permission.contacts,
    Permission.storage,
    Permission.notification,
  ];

  for (final permission in permissions) {
    final status = await permission.request();
    if (status.isDenied) {
      // Log permission denial but continue app initialization
      print('Permission denied: $permission');
    }
  }
}

/// Initialize emergency gesture detection
Future<void> _initializeEmergencyGestureDetection() async {
  // Initialize accelerometer for shake detection
  accelerometerEvents.listen((AccelerometerEvent event) {
    final magnitude = event.x * event.x + event.y * event.y + event.z * event.z;
    
    // Detect rapid shake for emergency trigger
    if (magnitude > 30) {
      // Implementation would trigger emergency after rapid consecutive shakes
    }
  });

  // Initialize power button detection
  // This would require platform-specific implementation
}

/// Emergency types
enum EmergencyType {
  panicButton,
  voiceCommand,
  gesture,
  ussd,
  wearable,
  autoDetected,
} 