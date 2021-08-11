import { fireEvent, render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { signIn } from 'next-auth/client';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';

import { SubscribeButton } from './SubscribeButton';

jest.mock('next-auth/client');

jest.mock('next/router');

describe('SubscribeButton component', () => {
  it('should render correctly', () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('should redirect user to sign in when not authenticated', () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    const signInMocked = mocked(signIn);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(signInMocked).toBeCalledWith('github');
  });

  it('should redirect user to posts when usar already has a subscription', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires',
      },
      false,
    ]);

    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(pushMock).toBeCalledWith('/posts');
  });
});
