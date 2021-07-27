import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="new" height="300px" />
      </div>
      <main className={styles.container}>
        <article className={styles.post}>
          <div className={styles.postHeader}>
            <strong>{post.data.title}</strong>
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
          </div>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{
              __html: post.data.content[0].body[0].text,
            }}
          />
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  return {
    paths: [{ params: { slug: '' } }],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('blog-posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.last_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: [
        {
          heading: response.data.content[0].heading,
          body: [
            {
              text: RichText.asHtml(response.data.content[0].body),
            },
          ],
        },
      ],
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30min
  };
};
