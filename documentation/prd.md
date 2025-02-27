# Product Requirements Document (PRD) - MvX SDK Tester

**1. Introduction**

*   **Project Name:** MvX SDK Tester
*   **Version:** 1.0
*   **Date:** October 26, 2023
*   **Status:** Draft
*   **Author:** Sylla

**1.1. Purpose**

This document outlines the requirements for MvX SDK Tester, an open-source web application designed to simplify access to, exploration, and interaction with SDKs and ABIs within the MultiversX ecosystem. It serves as a guide for development, testing, and maintenance of the project.

**1.2. Goals**

*   Provide a centralized, user-friendly platform for developers to discover, explore, and test MultiversX SDKs and ABIs.
*   Enable developers to quickly understand the functionality of various SDKs and their interaction with smart contracts.
*   Facilitate rapid prototyping and testing of MultiversX-based applications.
*   Foster community collaboration and contribution through an open-source project.

**1.3. Target Audience**

*   Developers working with the MultiversX blockchain.
*   Developers participating in hackathons or other development initiatives within the MultiversX ecosystem.
*   Community contributors to the project.

**2. Background**

Developers often face challenges in understanding and utilizing the various SDKs available for the MultiversX blockchain. This can slow down development and make it difficult to quickly prototype and test new ideas. MvX SDK Tester addresses this by providing a platform that allows developers to easily access, explore, and interact with these SDKs and their associated ABIs.

**3. Overall Description**

MvX SDK Tester is a web application built with React.js. The application consists of multiple pages/routes, providing a structured experience for exploring SDKs and running tests. It provides a searchable and browsable list of SDKs and ABIs, along with features for interacting with them (e.g., executing functions, viewing transaction results). The UI will be minimalistic, inspired by "The Monospace Web", and adhere to accessible design principles.

**4. AI-Assisted Development and Design Tools**

This project leverages several AI tools to accelerate development and enhance the user experience:

*   **PRD & Reflection:** Grok 3 Deepsearch and Gemini 2.0 Flash Experimental are used for in-depth PRD analysis, feature brainstorming, and continuous reflection on project direction and goals.
*   **UI Initial Design:** Lovable and v0 by Vercel are employed to generate initial UI prototypes and explore design possibilities based on the "Monospace Web" aesthetic.
*   **Development & Code Generation:** Cursor, powered by Sonnet, is the primary code editor.  It is used for code generation, refactoring, and bug fixing, leveraging its AI capabilities to improve code quality and development speed.

**5. Features**

**5.1. Core Features**

*   **SDK and ABI Listing:** A curated list of SDKs and ABIs relevant to MultiversX. Each item includes:
    *   Name
    *   Description
    *   GitHub Link
    *   Tags (using the structured tag system defined below)
    *   Link to a dedicated SDK exploration page.

*   **SDK Exploration Page:** A dedicated page for each SDK, allowing users to delve deeper:
    *   Display the SDK's GitHub repository structure (files and directories) in a tree-like view.
    *   Display the README file (by default) or the content of any selected file using CodeMirror.
    *   [Future Enhancement] Show a list of available functions/methods in the SDK (automatically extracted from the documentation or code).

*   **ABI Interaction Section:**
    *   For SDKs that interact with smart contracts, provide an interface for users to interact with the ABIs:
    *   Allow users to input smart contract addresses.
    *   Automatically load the corresponding ABI (if available, or allow users to upload it).
    *   Generate UI forms for calling functions in the ABI, based on the function parameters.
    *   Allow users to input parameters for each function call.
    *   Enable users to execute the function call and display the transaction results.

*   **Example Code Snippets:**
    *   For each SDK and ABI function, provide example code snippets that show how to use it in practice. These can be pre-populated or generated dynamically based on the user's selections.

*   **Custom Repository Input:** A text field where users can enter a GitHub repository link to explore its contents. This will primarily be used to add ABIs if not already present.

*   **Chatbot Integration (Optional, Future Enhancement):**
    *   An AI-powered chatbot (integrated via Google AI Studio or an alternative) to answer questions about the SDKs and ABIs. It is recommended to prioritize the core ABI interaction features first.

**5.2. Tag Management**

*   **Tag Structure:** Tags are defined by the following interface:

    ```typescript
    export interface Tag {
      name: string;
      category: TagCategory;
    }

    export enum TagCategory {
      LANGUAGE = "Language",
      PURPOSE = "Purpose",
      FRAMEWORK = "Framework",
      PLATFORM = "Platform",
      TECHNOLOGY = "Technology",
      OTHER = "Other",
    }

    export const tagCategoryColors: { [key in TagCategory]: string } = {
      [TagCategory.LANGUAGE]: "#29ABE2", // Light Blue
      [TagCategory.PURPOSE]: "#8E44AD", // Purple
      [TagCategory.FRAMEWORK]: "#27AE60", // Green
      [TagCategory.PLATFORM]: "#F39C12", // Orange
      [TagCategory.TECHNOLOGY]: "#D35400", // Dark Orange
      [TagCategory.OTHER]: "#7F8C8D", // Grey
    };
    ```

*   **Tag Display:** Tags will be visually displayed using the corresponding color from `tagCategoryColors` for each tag category. This allows users to quickly understand the type of each tag.
*   **Tag Filtering (Future Enhancement):** Allow users to filter the SDK/ABI list by tag category and specific tag names.

**5.3. User Interface (UI)**

*   **General:**
    *   Minimalistic design inspired by "The Monospace Web".
    *   Full responsivity to adapt to different screen sizes.
    *   Accessible design principles (e.g., sufficient color contrast).
*   **Font:** Monospace font for all text elements.
*   **Color Palette:** Neutral and minimalist tones (grays, white, black).
*   **Layout:** Grid-based layout for visual coherence. Different sections should be clearly separated.
*   **Navigation:** A clear and intuitive navigation system to navigate between different SDKs and pages.
*   **Components:**
    *   Clickable list for repository structure (tree view).
    *   CodeMirror editor for displaying README and file contents.
    *   UI forms for ABI interaction (generated dynamically).
    *   Output display for transaction results and error messages.

**6. Content**

**6.1. SDK and ABI List**

*(The specific list of SDKs and ABIs is maintained separately and referenced here. See Appendix for a potential example)*

**6.2. Documentation**

Clear and concise documentation will be provided within the repository, including:

*   **README:** Overview of the project, setup instructions, contribution guidelines, code of conduct, and license information.
*   **API Documentation:** Detailed information on the MultiversX API usage.
*   **Contribution Guidelines:** Guidelines for contributing to the project, including code style, testing, and pull request process.
*   **For each SDK:** Information on how to use the SDK, including code snippets and examples.

**7. Technical Requirements**

*   **Frontend:**
    *   React.js (latest stable version)
    *   Axios or Fetch (for making API calls to GitHub, the MultiversX blockchain, etc.)
    *   Tailwind CSS (or a similar CSS framework)
    *   CodeMirror (for code display)
    *   UI Component library (e.g., Material UI, Ant Design, or custom components)
*   **MultiversX Blockchain Interaction:**
    *   Use appropriate libraries to interact with the MultiversX blockchain (e.g., `mx-sdk-js`, `mx-sdk-py`, etc., depending on the needs)
    *   Handle wallet integration and transaction signing.
*   **GitHub API:**
    *   Utilize the GitHub API v3 for fetching repository data.
    *   Implement error handling and rate limit management.
*   **Deployment:**
    *   The application should be deployable on platforms like Netlify or Vercel.
*   **Security:**
    *   Sanitize user input to prevent Cross-Site Scripting (XSS) vulnerabilities.
    *   Follow security best practices for handling wallet keys and transaction signing.

**8. Open Source Considerations**

*   **License:** MIT License
*   **Repository:** Hosted on GitHub
*   **Contribution Guidelines:** Clear guidelines for contributing, including coding style, testing, and pull request process.
*   **Code of Conduct:** Establish a CODE OF CONDUCT to maintain an inclusive and respectful environment.
*   **Community Management:** Utilize GitHub Issues for bug reports and feature requests.

**9. Testing and Quality Assurance**

*   **Unit Tests:** Implement unit tests for individual components and functions.
*   **Integration Tests:** Implement integration tests to ensure that different parts of the application work together correctly, including the ABI interaction features.
*   **User Testing:** Conduct user testing to gather feedback and improve the user experience.
*   **Accessibility Testing:** Test the application for accessibility compliance (WCAG guidelines).

**10. Support and Maintenance**

*   The project will be maintained by Sylla and the community.
*   Regular updates will be made to keep the list of SDKs and ABIs current and ensure compatibility with the latest MultiversX updates.
*   Contributions will be encouraged to keep the platform relevant and up-to-date.

**11. Release Criteria**

*   All core features are implemented and tested.
*   All known bugs are fixed.
*   Documentation is complete and accurate.
*   The application is deployed to a stable environment.
*   Open-source licensing and contribution guidelines are in place.

**12. Appendices**

*   UI Mockups - *To be added*
*   API Endpoints - *To be added (especially for the MultiversX blockchain interaction)*

**Key Changes and Considerations:**

*   **Multi-Page Application:** The application has multiple routes.
*   **Focus on ABI Interaction:** The design should prioritize ease of use for entering contract addresses, ABI loading, and function execution.
*   **AI-Assisted Development:**  Clear strategy for leveraging AI tools to improve the development and design process.
*   **Chatbot Reduced Priority:** The chatbot is an optional enhancement.
*   **Security is Critical:** Wallet interaction and transaction signing should be handled very carefully.  Research and implement best security practices.
*   **Dynamic UI Generation:** The UI forms for ABI interaction should ideally be generated dynamically based on the ABI definition. This will make it easier to support different contracts.

This PRD provides a focused and practical guide for building MvX SDK Tester, emphasizing its core functionality, AI-assisted development, and open-source nature.