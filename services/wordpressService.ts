import { WordPressSite, Post, DailyPostsData } from '../types';

interface WpPost {
  id: number;
  date_gmt: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  _embedded: {
    author: {
      name: string;
    }[];
    'wp:term'?: {
      id: number;
      name: string;
      taxonomy: string;
    }[][];
  };
}

interface WpUser {
  id: number;
  name: string;
}

interface WpCategory {
    id: number;
    name: string;
}

export const fetchCategories = async (site: WordPressSite): Promise<{ id: number; name: string }[]> => {
    const url = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/categories?per_page=100`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Basic ${btoa(`${site.username}:${site.appPassword}`)}` },
        });
        if (!response.ok) {
             if (response.status === 401) {
                throw new Error(`Authentication failed. Check Username and Application Password.`);
            }
            throw new Error(`Server responded with status: ${response.status}`);
        }
        const categories: WpCategory[] = await response.json();
        return categories.map(cat => ({ id: cat.id, name: cat.name }));
    } catch (error) {
        console.error(`Error fetching categories from ${site.name}:`, error);
        if (error instanceof Error) {
            throw new Error(`Connection Error: ${error.message}`);
        }
        throw new Error(`An unknown connection error occurred.`);
    }
};

export const fetchAuthorsForSite = async (site: WordPressSite): Promise<{ id: number; name: string }[]> => {
  const url = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/users?roles=administrator,editor,author&per_page=100`;
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Basic ${btoa(`${site.username}:${site.appPassword}`)}` },
    });
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(`Authentication failed. Check Username and Application Password.`);
        }
        throw new Error(`Server responded with status: ${response.status}`);
    }
    const users: WpUser[] = await response.json();
    return users.map(user => ({ id: user.id, name: user.name }));
  } catch (error) {
    console.error(`Error fetching authors from ${site.name}:`, error);
     if (error instanceof Error) {
      throw new Error(`Connection Error: ${error.message}`);
    }
    throw new Error(`An unknown connection error occurred.`);
  }
};

const fetchPostsForSite = async (site: WordPressSite, startDate: string, endDate: string): Promise<Post[]> => {
  const url = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/posts?_embed&per_page=100&after=${startDate}&before=${endDate}&status=publish`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(`${site.username}:${site.appPassword}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
          throw new Error(`Authentication failed for "${site.name}". Please check credentials in Settings.`);
      }
      throw new Error(`Failed to fetch posts from ${site.name}: Server responded with ${response.statusText} (${response.status})`);
    }

    const posts: WpPost[] = await response.json();
    
    return posts.map(post => {
      const postContent = post.content?.rendered || '';

      // Extract category
      const terms = post._embedded?.['wp:term'] ?? [];
      const categories = (terms[0] ?? []).filter(term => term.taxonomy === 'category');
      const category = categories[0]?.name ?? 'Uncategorized';

      // Count images
      const imageCount = (postContent.match(/<img/g) || []).length;
      
      // Check for recipe card plugin and its details
      const hasRecipeCardPlugin = /tasty-recipes|data-tr-id|wprm-recipe|mv-recipe-card|wpzoom-recipe-card/.test(postContent);
      let hasIngredients = false;
      let hasInstructions = false;
      let hasNotes = false;
      let hasPrepTime = false;
      let hasCookTime = false;
      let hasTotalTime = false;
      let hasNutrition = false;

      if (hasRecipeCardPlugin) {
          hasIngredients = /ingredients/i.test(postContent);
          hasInstructions = /instructions/i.test(postContent);
          hasNotes = /notes/i.test(postContent);
          hasPrepTime = /prep time/i.test(postContent);
          hasCookTime = /cook time/i.test(postContent);
          hasTotalTime = /total time/i.test(postContent);
          hasNutrition = /nutrition/i.test(postContent) || /calories/i.test(postContent);
      }

      // Check for FAQ
      const hasFaqSchema = postContent.includes('"@type": "FAQPage"');
      const hasYoastFaq = postContent.includes('yoast-faq-block');
      const hasAccordionFaq = postContent.includes('class="faq-accordion"') || postContent.includes('class="faq-section"');
      const hasFAQ = hasFaqSchema || hasYoastFaq || hasAccordionFaq;

      return {
        link: post.link,
        title: post.title.rendered.replace(/&#8217;/g, "'").replace(/&amp;/g, "&"), // Basic decoding
        author: post._embedded?.author[0]?.name || 'Unknown Author',
        publishDate: post.date_gmt,
        category,
        imageCount,
        hasIngredients,
        hasInstructions,
        hasNotes,
        hasPrepTime,
        hasCookTime,
        hasTotalTime,
        hasNutrition,
        hasFAQ,
      };
    });

  } catch (error) {
    console.error(`Error fetching from ${site.name}:`, error);
    if (error instanceof Error) {
        throw error; // Re-throw the specific error from above
    }
    throw new Error(`An unknown network error occurred while connecting to ${site.name}.`);
  }
};

export const fetchAllPosts = async (sites: WordPressSite[], dateRange: { start: string, end: string }): Promise<{ data: DailyPostsData[], error: string | null }> => {
  let allPostsData: DailyPostsData[] = [];
  let fetchError: string | null = null;

  const postPromises = sites.map(site =>
    fetchPostsForSite(site, dateRange.start, dateRange.end)
      .then(posts => {
        if (posts.length > 0) {
          // Group posts by author for the current site
          const postsByAuthor: Record<string, Post[]> = {};
          posts.forEach(p => {
            if (!postsByAuthor[p.author]) {
              postsByAuthor[p.author] = [];
            }
            postsByAuthor[p.author].push(p);
          });

          // Create DailyPostsData objects for each author on the site
          const sitePosts: DailyPostsData[] = [];
          for (const authorName of Object.keys(postsByAuthor)) {
            sitePosts.push({
              siteId: site.id,
              authorFirstName: authorName.split(' ')[0] || 'Unknown', // Use first name for matching
              posts: postsByAuthor[authorName]
            });
          }
          return sitePosts;
        }
        return [];
      })
      .catch(error => {
        if (error instanceof Error && !fetchError) {
          fetchError = error.message; // Capture the first error
        }
        return []; // Return an empty array for this site on error, so Promise.all doesn't fail
      })
  );

  const results = await Promise.all(postPromises);
  allPostsData = results.flat();

  // Sort by total posts desc after all data is fetched and combined
  allPostsData.sort((a, b) => b.posts.length - a.posts.length);

  return { data: allPostsData, error: fetchError };
};