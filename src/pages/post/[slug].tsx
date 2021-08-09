import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import React from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: string;
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // const total = post.data.content.reduce((sumTotal, content) => {
  //   const sumWordsHeading = String(content.heading).split(/[\s]+/);
  //   const sumWordsBody = RichText.asText(content.body).split(/[\s]+/);
  //   sumTotal += sumWordsHeading.length + sumWordsBody.length;
  //   return sumTotal;
  // }, 0);

  // console.log(total);

  return (
    <div>
      <div className={styles.postBanner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>
      <div className={styles.postContent}>
        <h1>{post.data.title}</h1>
        <div className={styles.postExtraInfo}>
          <time>
            <FiCalendar />
            {post.first_publication_date}
          </time>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {post.first_publication_date}
          </span>
        </div>
        <main>
          <div dangerouslySetInnerHTML={{ __html: post.data.content }} />

          {/* {post.data.content.map((item, index) => (
            <div key={index} className={styles.post}>
              {item.heading && <h2>{item.heading}</h2>}
              

              {item.body.map(paragraph => (
                <p key={Math.random()}>{paragraph.text}</p>
              ))}
            </div>
          ))} */}
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      "'Hoje é' eeee",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
      content: RichText.asHtml(response.data.content),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
