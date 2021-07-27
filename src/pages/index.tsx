import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <Head>
        <title>Posts | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <p>
                    <FiCalendar className={styles.icon} />
                    {post.first_publication_date}
                  </p>
                  <p>
                    <FiUser className={styles.icon} />
                    {post.data.author}
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </div>
        <a className={styles.link}>Carregar mais posts</a>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'blog-posts')],
    {
      fetch: ['blog-posts.title', 'blog-posts.subtitle', 'blog-posts.author'],
      pageSize: 1,
      page: 1,
    }
  );
  console.log(postsResponse);
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.last_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: { postsPagination: { results: posts } },
  };
};
