import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';
import { cloneElement, ReactElement } from 'react';

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({
  activeClassName,
  children,
  ...props
}: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === props.href ? activeClassName : '';
  return <Link {...props}>{cloneElement(children, { className })}</Link>;
}
