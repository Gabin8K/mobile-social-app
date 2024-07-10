import { Stack } from 'expo-router';
import 'react-native-reanimated';
import Providers from '../providers/Providers';



export default function RootLayout() {

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen
          name={'(app)'}
        />
      </Stack>
    </Providers>
  );
}
