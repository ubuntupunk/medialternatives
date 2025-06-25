# Media Activism WordPress Site

A modern WordPress website focused on media activism, built with the Roots Bedrock framework. This site features a comprehensive handbook, educational resources, and tools for media activists and alternative journalism.

## 🎯 Project Overview

This WordPress site serves as a platform for media activism education and resources. It includes:

- **Main WordPress Site**: Content management for articles, resources, and community features
- **Media Activist's Handbook**: Static documentation site with coursework and case studies
- **Educational Resources**: Tools and guides for alternative media and journalism
- **Community Features**: Social sharing, commenting, and engagement tools

## ✨ Key Features

### WordPress Features
- **Modern Stack**: Built on Roots Bedrock with Composer dependency management
- **Custom Themes**: Blaskan child theme with media activism customizations
- **SEO Optimized**: Yoast SEO, structured data, and social media integration
- **Performance**: LiteSpeed caching, image optimization, and CDN integration
- **Security**: Wordfence protection, SSL enforcement, and secure authentication
- **Analytics**: Google Analytics integration with custom tracking

### Content Features
- **Custom Post Types**: AdSense management system with Gutenberg blocks
- **Multi-language Support**: Translation-ready with language packs
- **Social Integration**: ActivityPub, social sharing, and community features
- **Contact Forms**: Contact Form 7 integration for user engagement
- **Media Management**: Advanced upload handling and optimization

### Technical Features
- **GraphQL API**: JWT authentication for headless capabilities
- **Progressive Web App**: PWA features for mobile experience
- **Search Integration**: Algolia-powered search functionality
- **Backup System**: Automated backup and restore capabilities
- **Health Monitoring**: WordPress health checks and troubleshooting tools

## 🛠 Technology Stack

- **Framework**: Roots Bedrock (WordPress)
- **Language**: PHP 7.1+
- **Dependency Management**: Composer
- **Environment Management**: Dotenv
- **Code Standards**: PSR-2 (PHP_CodeSniffer)
- **Build Tools**: WP-CLI
- **Caching**: LiteSpeed Cache, Object Caching
- **CDN**: Cloudflare integration
- **Analytics**: Google Analytics, Google Site Kit

## 📋 Requirements

- PHP >= 7.1
- MySQL 5.7+ or MariaDB 10.2+
- Composer
- Node.js (for theme development)
- Web server (Apache/Nginx) with SSL support

## 🚀 Installation

### 1. Clone and Install Dependencies
```bash
git clone [repository-url]
cd [project-directory]
composer install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost

# Environment
WP_ENV=development
WP_HOME=http://localhost:8000
WP_SITEURL=http://localhost:8000/wp

# Generate these with: https://roots.io/salts.html
AUTH_KEY=your_auth_key
SECURE_AUTH_KEY=your_secure_auth_key
# ... (add all WordPress salts)
```

### 3. Web Server Configuration
Set your web server document root to the `web/` directory:
```
/path/to/project/web/
```

### 4. Complete Setup
1. Visit your site to complete WordPress installation
2. Access admin at `/wp/wp-admin/`
3. Activate the Blaskan child theme
4. Configure plugins as needed

## 📁 Project Structure

```
├── config/                 # WordPress configuration
│   ├── application.php     # Main config
│   └── environments/       # Environment-specific configs
├── web/                    # Web root (document root)
│   ├── app/               # WordPress content
│   │   ├── mu-plugins/    # Must-use plugins
│   │   ├── plugins/       # Regular plugins (Composer managed)
│   │   ├── themes/        # WordPress themes
│   │   └── uploads/       # Media uploads
│   ├── handbook/          # Static handbook site
│   └── wp/               # WordPress core (Composer managed)
├── vendor/                # Composer dependencies
├── composer.json          # PHP dependencies
├── wp-cli.yml            # WP-CLI configuration
└── .env                  # Environment variables
```

## 🎨 Theme Development

### Active Themes
- **Parent**: Blaskan (Composer managed)
- **Child**: Blaskan Child (custom development)
- **Alternative**: Qi theme (available)

### Child Theme Features
- Google Analytics integration
- Custom post view tracking
- AdSense management system
- Author bio enhancements
- Custom Gutenberg blocks

### Development Workflow
```bash
# Watch for changes (if using build tools)
npm run watch

# Code standards check
composer test

# WP-CLI commands
wp --path=web/wp plugin list
wp --path=web/wp theme list
```

## 📖 Handbook Section

The site includes a static handbook at `/handbook/` featuring:
- Media activism coursework
- South African resistance case studies
- Alternative media strategies
- Educational resources and downloads

The handbook is built with:
- Bootstrap 5 framework
- FontAwesome icons
- Responsive design
- Downloadable content via Gumroad

## 🔧 Development Commands

### Composer
```bash
composer install          # Install dependencies
composer update           # Update dependencies
composer test             # Run code standards check
```

### WP-CLI
```bash
wp plugin list           # List installed plugins
wp theme list            # List available themes
wp db export backup.sql  # Export database
wp search-replace old.com new.com  # Update URLs
```

### Code Standards
```bash
./vendor/bin/phpcs       # Check code standards
./vendor/bin/phpcbf      # Fix code standards
```

## 🔒 Security Features

- SSL enforcement for admin and frontend
- File editing disabled in production
- Secure password hashing with bcrypt
- Wordfence security monitoring
- Login attempt limiting
- File modification restrictions
- Jetpack security features

## 🚀 Performance Optimization

- LiteSpeed Cache integration
- Image optimization and WebP support
- CSS/JS minification and concatenation
- Database optimization tools
- CDN integration (Cloudflare)
- Object caching support
- Lazy loading for images

## 🌍 Deployment

### Staging/Production
1. Set appropriate `WP_ENV` in `.env`
2. Configure production database
3. Set up SSL certificates
4. Configure caching (Redis/Memcached)
5. Set up automated backups
6. Configure monitoring and alerts

### Environment Variables
- `WP_ENV=production` - Disables debug, enables optimizations
- `WP_ENV=staging` - Staging environment settings
- `WP_ENV=development` - Enables debug, allows file modifications

## 📊 Analytics & Monitoring

- Google Analytics 4 integration
- Google Site Kit for webmaster tools
- Custom post view tracking
- WordPress health monitoring
- Performance monitoring via plugins
- Error logging and reporting

## 🤝 Contributing

1. Follow PSR-2 coding standards
2. Test changes in development environment
3. Use semantic commit messages
4. Update documentation as needed
5. Run code standards checks before committing

### Code Standards
- PHP: PSR-2
- WordPress: WordPress Coding Standards
- CSS: BEM methodology recommended
- JavaScript: ES6+ with proper linting

## 📚 Resources

- [Roots Bedrock Documentation](https://roots.io/docs/bedrock/)
- [WordPress Developer Handbook](https://developer.wordpress.org/)
- [Blaskan Theme Documentation](https://github.com/blaskan/blaskan)
- [Media Activist's Handbook](./web/handbook/)

## 📝 License

This project is licensed under the MIT License. See individual plugin and theme licenses for their respective terms.

## 🆘 Support & Troubleshooting

### Common Issues
- Ensure web server document root points to `web/` directory
- Check `.env` file configuration
- Verify file permissions for uploads directory
- Use Health Check plugin for WordPress issues

### Debug Mode
Set `WP_ENV=development` in `.env` to enable:
- Error display and logging
- Script debugging
- Query debugging
- File modification permissions

### Getting Help
- Check the `.agent.md` file for detailed development guidelines
- Review WordPress and Bedrock documentation
- Use WP-CLI for command-line troubleshooting
- Enable troubleshooting mode via Health Check plugin