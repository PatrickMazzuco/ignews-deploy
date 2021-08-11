import { render, screen } from '@testing-library/react';
import { ActiveLink } from './ActiveLink';

jest.mock('next/router', () => {
  return {
    useRouter: () => {
      return {
        asPath: '/',
      };
    },
  };
});

describe('ActiveLink component', () => {
  it('should render correctly', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should receive active class if the link is active', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText('Home')).toHaveClass('active');
  });
});
