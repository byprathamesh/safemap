import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  VStack,
  HStack
} from '@chakra-ui/react';
import { 
  WarningIcon, 
  CheckCircleIcon, 
  TimeIcon,
  PhoneIcon 
} from '@chakra-ui/icons';
import Head from 'next/head';
import { io, Socket } from 'socket.io-client';
import { formatDistance } from 'date-fns';
import EmergencyMap from '../components/EmergencyMap';
import StatsCards from '../components/StatsCards';
import RealtimeAlerts from '../components/RealtimeAlerts';
import EmergencyList from '../components/EmergencyList';

interface Emergency {
  id: string;
  userId: string;
  type: string;
  status: 'ACTIVE' | 'RESPONDED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  triggerMethod: string;
  createdAt: string;
  user: {
    name: string;
    phoneNumber: string;
  };
}

interface DashboardStats {
  activeEmergencies: number;
  totalEmergencies: number;
  averageResponseTime: number;
  resolvedToday: number;
}

const Dashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeEmergencies: 0,
    totalEmergencies: 0,
    averageResponseTime: 0,
    resolvedToday: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: {
        token: 'dashboard_token' // In production, use proper auth
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to SafeMap server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from SafeMap server');
      setIsConnected(false);
    });

    // Listen for real-time emergency updates
    newSocket.on('emergency:new', (emergency: Emergency) => {
      console.log('New emergency received:', emergency);
      setEmergencies(prev => [emergency, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeEmergencies: prev.activeEmergencies + 1,
        totalEmergencies: prev.totalEmergencies + 1
      }));
    });

    newSocket.on('emergency:update', (updatedEmergency: Emergency) => {
      console.log('Emergency updated:', updatedEmergency);
      setEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === updatedEmergency.id ? updatedEmergency : emergency
        )
      );
    });

    newSocket.on('emergency:resolved', (emergencyId: string) => {
      console.log('Emergency resolved:', emergencyId);
      setEmergencies(prev => 
        prev.map(emergency => 
          emergency.id === emergencyId 
            ? { ...emergency, status: 'RESOLVED' as const }
            : emergency
        )
      );
      
      setStats(prev => ({
        ...prev,
        activeEmergencies: Math.max(0, prev.activeEmergencies - 1),
        resolvedToday: prev.resolvedToday + 1
      }));
    });

    // Listen for stats updates
    newSocket.on('dashboard:stats', (newStats: DashboardStats) => {
      setStats(newStats);
    });

    setSocket(newSocket);

    // Fetch initial data
    fetchInitialData();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch emergencies
      const emergenciesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergencies`);
      const emergenciesData = await emergenciesResponse.json();
      setEmergencies(emergenciesData);

      // Fetch stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleEmergencyResponse = async (emergencyId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergencies/${emergencyId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responderId: 'dashboard-user' })
      });
    } catch (error) {
      console.error('Error responding to emergency:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'red';
      case 'RESPONDED': return 'yellow';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };

  return (
    <>
      <Head>
        <title>SafeMap Dashboard - Emergency Response System</title>
        <meta name="description" content="Real-time emergency monitoring dashboard for women's safety" />
      </Head>

      <Box bg={bgColor} minH="100vh" p={4}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="purple.600">
                SafeMap Emergency Dashboard
              </Heading>
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  Real-time monitoring system for women's safety
                </Text>
                <Badge 
                  colorScheme={isConnected ? 'green' : 'red'}
                  variant="solid"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </HStack>
            </VStack>
            <Spacer />
            <HStack>
              <Button leftIcon={<PhoneIcon />} colorScheme="red" size="sm">
                Emergency Call: 112
              </Button>
            </HStack>
          </Flex>

          {/* Connection Alert */}
          {!isConnected && (
            <Alert status="error">
              <AlertIcon />
              Connection to SafeMap server lost. Attempting to reconnect...
            </Alert>
          )}

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Main Content Grid */}
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
            {/* Emergency Map */}
            <GridItem colSpan={{ base: 12, lg: 8 }}>
              <Box bg={cardBg} p={6} rounded="lg" shadow="sm">
                <Heading size="md" mb={4}>Live Emergency Map</Heading>
                <EmergencyMap emergencies={emergencies} />
              </Box>
            </GridItem>

            {/* Real-time Alerts */}
            <GridItem colSpan={{ base: 12, lg: 4 }}>
              <RealtimeAlerts emergencies={emergencies.slice(0, 5)} />
            </GridItem>

            {/* Emergency List */}
            <GridItem colSpan={12}>
              <EmergencyList 
                emergencies={emergencies}
                onRespond={handleEmergencyResponse}
              />
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </>
  );
};

export default Dashboard; 