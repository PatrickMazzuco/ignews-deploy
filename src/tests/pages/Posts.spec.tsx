import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';

import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic');

const posts = [
  {
    slug: 'my-post',
    title: 'My Post',
    excerpt: 'Post excerpt',
    updatedAt: '10 de Abril',
  },
];

describe('Posts page', () => {
  it('should render correctly', () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText('My Post')).toBeInTheDocument();
  });

  it('should load initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-post',
            data: {
              title: [{ type: 'heading', text: 'My Post' }],
              content: [{ type: 'paragraph', text: 'post excerpt' }],
            },
            last_publication_date: '08-02-2021',
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-post',
              title: 'My Post',
              excerpt: 'post excerpt',
              updatedAt: '02 de agosto de 2021',
            },
          ],
        },
      })
    );
  });
});
