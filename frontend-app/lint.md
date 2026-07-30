[WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
$ next lint

./src/app/api/adsense/auth/route.ts
12:33  Error: 'PKCEChallengeMethod' is defined but never used.  @typescript-eslint/no-unused-vars
70:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/adsense/callback/route.ts
62:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/posts-with-placeholders/route.ts
63:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/search/route.ts
112:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
124:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
125:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/v1/adsense/route.ts
62:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/v1/search/route.ts
111:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
123:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
124:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api-debug/page.tsx
7:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api-test/page.tsx
159:29  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/app/case/page.tsx
52:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
55:65  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
80:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/adsense/page.tsx
52:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/analytics/page.tsx
7:10  Error: 'useAuthenticatedAPI' is defined but never used.  @typescript-eslint/no-unused-vars
44:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
48:10  Error: 'lastUpdated' is assigned a value but never used.  @typescript-eslint/no-unused-vars
49:10  Error: 'jetpackAuthStatus' is assigned a value but never used.  @typescript-eslint/no-unused-vars
49:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
73:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
73:58  Error: 'index' is defined but never used.  @typescript-eslint/no-unused-vars
164:4  Warning: React Hook useEffect has missing dependencies: 'fetchJetpackDataWithAuth' and 'token'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
185:7  Error: 'fetchJetpackDataWithCentralizedAuth' is assigned a value but never used.  @typescript-eslint/no-unused-vars
197:7  Error: 'initiateWordPressOAuth' is assigned a value but never used.  @typescript-eslint/no-unused-vars
203:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
696:73  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
899:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
929:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
955:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/charts/page.tsx
11:9  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
17:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
329:69  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/content/page.tsx
12:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
30:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:22  Error: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
72:54  Error: 'index' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/facebook/page.tsx
47:46  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
47:55  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
48:25  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
48:40  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
48:46  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
48:52  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
53:35  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
54:33  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
54:49  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
54:53  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
54:72  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
72:29  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
72:47  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./src/app/dashboard/image-generator/debug/page.tsx
7:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
345:21  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/app/dashboard/image-generator/page.tsx
471:45  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
495:47  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/overview/page.tsx
47:11  Error: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
51:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:10  Error: 'adSenseData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
53:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:10  Error: 'seoData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
54:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/page.tsx
167:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
200:81  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
222:6  Warning: React Hook useEffect has a missing dependency: 'generateRecentActivity'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
236:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/search/SearchResults.tsx
50:16  Error: '_err' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/Layout/Sidebar.tsx
13:8  Error: 'DonateWidget' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/Widgets/DonateWidget.tsx
2:8  Error: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/Widgets/SearchWidget.tsx
104:14  Error: '_err' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/Widgets/__tests__/AdSenseWidget.test.tsx
11:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
19:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
111:11  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/__tests__/useImageGenerator.test.ts
220:9  Error: 'bulkResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/useAuth.ts
144:14  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/api-review.ts
166:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
241:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
291:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
291:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
293:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/api-testing.ts
15:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
18:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
30:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
188:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
218:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
218:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
392:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
393:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
537:7  Error: 'rampUp' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/api-versioning.ts
164:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:11  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
167:4  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/auth.ts
151:12  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/cache.ts
9:9  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
45:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
68:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
192:73  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
262:16  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
313:16  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/compliance.ts
182:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
324:14  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
327:66  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
339:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
416:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
435:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
447:90  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/docs-generator.ts
49:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
125:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
137:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
147:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
149:70  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
171:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
208:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
209:70  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
236:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
236:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
243:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
254:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
255:68  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
284:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
293:86  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
318:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
344:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
345:68  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/jwt.ts
36:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/monitoring.ts
202:16  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/oauth-security.ts
88:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
110:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
117:12  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
155:33  Error: 'sessionId' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/user-store.ts
71:13  Error: 'passwordHash' is assigned a value but never used.  @typescript-eslint/no-unused-vars
80:13  Error: 'passwordHash' is assigned a value but never used.  @typescript-eslint/no-unused-vars
103:13  Error: 'passwordHash' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/validation.ts
7:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
111:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
120:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/avatarStorage.ts
273:50  Error: 'metadata' is defined but never used.  @typescript-eslint/no-unused-vars
308:14  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
313:16  Error: 'userId' is defined but never used.  @typescript-eslint/no-unused-vars
338:50  Error: 'metadata' is defined but never used.  @typescript-eslint/no-unused-vars
371:14  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/facebook-api.ts
2:10  Error: 'SITE_CONFIG' is defined but never used.  @typescript-eslint/no-unused-vars
3:1  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
4:12  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
108:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
129:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
130:69  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
155:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
164:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
184:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
190:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
198:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
224:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
225:87  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/wordpress-api.ts
37:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
206:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
384:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
418:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/types/google.ts
181:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
186:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/types/index.ts
178:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/types/wordpress.ts
62:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
98:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
123:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
146:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
184:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
205:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/__tests__/helpers.test.ts
46:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/api-debug.ts
8:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
196:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/debug.ts
12:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
45:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/helpers.ts
225:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
225:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
278:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
278:73  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
296:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
313:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/utils/legacyUrlMatcher.ts
44:16  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars
133:20  Error: '_error' is defined but never used.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[ELIFECYCLE] Command failed with exit code 1.
