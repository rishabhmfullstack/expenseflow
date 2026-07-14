import '@testing-library/jest-dom';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
});
