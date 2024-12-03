# Exploronomics: Exploring Global Economics

![Exploronomics globe](img/exploronomics_globe.png)

Exploronomics provides an intuitive and visually engaging way to explore the economics of countries around the world. Users can interact with a 3D globe, click on countries to learn more about them, and view key information displayed dynamically in a user-friendly modal window.

This project leverages modern web technologies, including React, D3.js, and GitHub Pages for deployment.

## Features
- Interactive Globe: Rotate and zoom the globe by dragging or scrolling.
- Country Highlighting: Hover over a country to highlight it.
- Country Selection: Click on a country to display additional details in a modal window.
- Responsive Design: Scales dynamically to fit different screen sizes.
- GitHub Pages Deployment: Easily accessible via a public GitHub repository.

## Getting Started

### Prerequisites
- Node.js and npm: Install from Node.js official site.
- Git: Ensure Git is installed and set up.

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/exploronomics.git
cd exploronomics
Install dependencies:
```

```bash
npm install
Start the development server:
```

```bash
npm start
Visit http://localhost:3000 in your browser to see the app in action.
```

## Contributing

Contributions are welcome! Please follow these guidelines to ensure smooth collaboration.

### Workflow for Development

1. Clone and Set Up the Repository

Fork the repository, clone your fork, and create a feature branch:

```bash
git clone https://github.com/your-username/exploronomics.git
cd exploronomics
git checkout -b feature/my-new-feature
```

2. Make Your Changes

Develop your feature or fix. For UI changes, test locally to ensure compatibility with the app's design and interactivity.

3. Commit and Push

Commit your changes with a meaningful message:

```bash
git commit -m "Add feature to highlight countries"
```

Push to your fork:

```bash
git push origin feature/my-new-feature
```

4. Create a Pull Request

Navigate to the original repository and create a pull request from your fork.

### Deploying Updates to GitHub Pages

To ensure the app remains live and up-to-date on GitHub Pages:

1. Make Changes

Edit the app as necessary, ensuring the main src files are updated.

2. Update package.json

Verify that the homepage field in package.json is correctly set to:

```json
"homepage": "https://your-username.github.io/exploronomics"
```

3. Build the Project

Generate production-ready files:

```bash
npm run build
```

4. Deploy to GitHub Pages

Deploy the build folder to the gh-pages branch:

```bash
npm run deploy
```

5. Verify Deployment

Visit https://your-username.github.io/exploronomics to verify the changes are live.

## Known Technicalities

### GitHub Pages & gh-pages Branch

GitHub Pages serves files from the gh-pages branch. The npm run deploy script automates the process of building the app and pushing the build directory to gh-pages.

### Relative File Paths

When hosting with GitHub Pages, ensure that:

- Static files (e.g., GeoJSON data) are stored in public/ and referenced with relative paths.
- The base tag in index.html is configured for GitHub Pages by adding:

```html
<base href="%PUBLIC_URL%/">
```

## Future Improvements
- Integrate more economic indicators for each country.
- Add data visualization such as graphs and charts.
- Enhance mobile support with touch-based interactions.

## License

This project is open-source and available under the MIT License.

