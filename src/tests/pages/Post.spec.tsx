import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getSession } from 'next-auth/client';

import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client');
jest.mock('../../services/prismic');

const post = {
  slug: 'my-post',
  title: 'My Post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10 de Abril',
};

describe('Post page', () => {
  it('should render correctly', () => {
    render(<Post post={post} />);

    expect(screen.getByText('My Post')).toBeInTheDocument();
    expect(screen.getByText('Post excerpt')).toBeInTheDocument();
  });

  it('should redirect user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: { slug: 'my-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        }),
      })
    );
  });

  it('should load initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subcription',
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My Post' }],
          content: [{ type: 'paragraph', text: 'post excerpt' }],
        },
        last_publication_date: '08-02-2021',
      }),
    } as any);

    const response = await getServerSideProps({
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
