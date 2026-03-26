import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Smoke test', () => {
  it('renders text', () => {
    render(<Text>GauchoCowork</Text>);
    expect(screen.getByText('GauchoCowork')).toBeTruthy();
  });
});
