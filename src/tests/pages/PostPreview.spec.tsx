import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

const post = {
  slug: 'my-post',
  title: 'My Post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10 de Abril',
};

describe('PostPreview page', () => {
  it('should render correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<PostPreview post={post} />);

    expect(screen.getByText('My Post')).toBeInTheDocument();
    expect(screen.getByText('Post excerpt')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('should redirect user to full post if subscription is found', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: 'fake-active-subscription',
      },
      false,
    ] as any);

    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<PostPreview post={post} />);

    expect(pushMock).toBeCalledWith('/posts/my-post');
  });

  it('should load initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My Post' }],
          content: [{ type: 'paragraph', text: 'post excerpt' }],
        },
        last_publication_date: '08-02-2021',
      }),
    } as any);

    const response = await getStaticProps({
      params: { slug: 'my-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-post',
            title: 'My Post',
            content: '<p>post excerpt</p>',
            updatedAt: '02 de agosto de 2021',
          },
        },
      })
    );
  });
});
