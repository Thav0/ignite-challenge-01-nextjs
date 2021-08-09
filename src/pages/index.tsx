import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';

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
  const [posts, setNewPosts] = useState<Post[]>(postsPagination.results);
  const [canLoadMore, setCanLoadMore] = useState(true);

  async function getMorePosts(url: string) {
    const currentPosts = [...posts];

    const getMorePosts = await fetch(url)
      .then(response => response.json())
      .then(data => data);

    const serializeNewPosts = getMorePosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "'Hoje é' eeee",
          {
            locale: ptBR,
          }
        ),
        data: {
          title: RichText.asText(post.data.title),
          subtitle:
            post.data.content.find(content => content.type === 'paragraph')
              ?.text ?? '',
          author: RichText.asText(post.data.author),
        },
      };
    })[0];

    setNewPosts([...currentPosts, serializeNewPosts]);
    setCanLoadMore(false);
  }

  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <div>
                  <time>
                    <FiCalendar />
                    {post.first_publication_date}
                  </time>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}

          {}
        </div>

        {canLoadMore && postsPagination.next_page && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => getMorePosts(postsPagination.next_page)}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.sub_title', 'post.content', 'post.author'],
      pageSize: 4,
    }
  );

  const nextPageUrl = response.next_page;

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "'Hoje é' eeee",
        {
          locale: ptBR,
        }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle:
          post.data.content.find(content => content.type === 'paragraph')
            ?.text ?? '',
        author: RichText.asText(post.data.author),
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: nextPageUrl,
      },
    },
  };
};
