import { Text, Button, useToast } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { SITE_URL } from '../../utils/config'

export default function New() {
  const seoTitle = 'Lambula - Bridge your assets in seconds'
  const seoDescription = ''

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        canonical={`${SITE_URL}/new`}
        openGraph={{
          title: seoTitle,
          description: seoDescription,
          url: `${SITE_URL}/new`,
          type: 'website',
          site_name: 'Lambula',
          images: [
            {
              url: `${SITE_URL}/huangshan.png`,
              width: 1200,
              height: 630,
              alt: 'Lambula - Bridge your assets in seconds',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: '@w3hc8',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'create, new content, web3, dapp, ethereum',
          },
        ]}
      />
      <main>
        <Text>A brand new page! 😋</Text>
      </main>
    </>
  )
}
