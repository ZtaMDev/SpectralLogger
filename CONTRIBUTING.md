# Contributing to Spectral Logs

Thank you for your interest in contributing to Spectral Logs.
Spectral Logs is a high-performance, zero-dependency logging library for Node.js, TypeScript, Bun, and Deno.
The goal of this project is to deliver speed, reliability, and clean architecture while maintaining a minimal footprint.

⸻

# Overview

All contributions are made through pull requests.
The main branch is protected and cannot be pushed to directly.
Each pull request requires at least one maintainer approval before it can be merged.

This ensures that the codebase remains stable, consistent, and production-ready at all times.

⸻

## 1. Repository Setup

Fork and Clone

Fork the repository on GitHub and clone your fork locally:

’’’bash
git clone https://github.com/ZtaMDev/SpectralLogs.git
cd SpectralLogs
’’’

Add the upstream remote to stay in sync with the official repository:

’’’bash
git remote add upstream https://github.com/ZtaMDev/SpectralLogs.git
’’’

To update your fork later:

’’’bash
git fetch upstream
git merge upstream/main
’’’

⸻

## 2. Branching Strategy

All work must be done on a separate branch based on main.

Use clear and consistent branch names:

’’’bash
git checkout -b feat/improve-color-system
’’’

Recommended prefixes:
	•	feat/ → new features
	•	fix/ → bug fixes
	•	docs/ → documentation changes
	•	refactor/ → code refactors (no functional changes)
	•	test/ → test additions or improvements
	•	chore/ → maintenance tasks or tooling changes

⸻

## 3. Installing Dependencies

Spectral Logs uses npm for dependency management:

’’’bash
npm install
’’’

⸻

## 4. Build, Lint, and Test

Before opening a pull request, ensure the code builds successfully and passes all checks.

’’’bash
npm run build
npm run lint
npm test
’’’

## 5. Commit Message Convention

This project follows the Conventional Commits format for all commits.

<type>(scope): short description

Examples:

feat(core): add plugin registration API
fix(logger): prevent double stack trace on errors
docs(readme): clarify CLI usage section

This convention keeps the commit history clean and allows for automated changelog generation in future releases.

⸻

## 6. Submitting a Pull Request

Push your branch to your fork:

’’’bash
git push origin feat/improve-color-system
’’’

Then open a pull request (PR) against the main branch of:

https://github.com/ZtaMDev/SpectralLogs

Pull Request Requirements:
	•	Direct pushes to main are not allowed.
	•	Each PR must pass all CI checks (build, lint, tests).
	•	At least one maintainer approval is required before merge.
	•	Use a clear and descriptive PR title.
	•	Include context and reasoning for the change in the PR description.

⸻

## 7. Code Guidelines
	•	Use TypeScript (ESNext) syntax and types consistently.
	•	Avoid adding dependencies — Spectral Logs must remain zero-dependency.
	•	Favor clear, explicit code over clever but obscure implementations.
	•	Maintain existing architecture and conventions.
	•	Public APIs should remain stable; breaking changes require discussion beforehand.
	•	Document new public APIs or configuration options.

⸻

## 8. Testing

All new features or bug fixes should include relevant test coverage.

## 9. Documentation

If your changes affect how users interact with the library:
	•	Update the relevant examples in README.md or the /docs directory.
	•	Keep documentation minimal, technical, and consistent with implementation.
	•	Avoid duplication between code comments and docs.

If you add or modify features that will appear in the website documentation, please update or propose corresponding documentation changes in the docs site repository.

⸻

## 10. Large or Breaking Changes

For any major change (e.g., new plugin APIs, core refactors, or breaking updates), open an issue first.
This allows discussion of design, performance implications, and compatibility before implementation begins.

⸻

## 11. Pull Request Checklist

Before submitting a PR, verify the following:
	•	Code builds successfully (npm run build)
	•	Linting and formatting pass (npm run lint and npm run format)
	•	All tests pass (npm test)
	•	Documentation or examples updated (if applicable)
	•	Commit messages follow Conventional Commits
	•	The PR description clearly explains the change and motivation

⸻

## 12. Branch Protection Policy

The following rules apply to the main branch:
	•	Direct pushes are disabled.
	•	All status checks must pass before merging.
	•	At least one reviewer approval is required.
	•	Force pushes are not allowed.
	•	Merges must be done through GitHub’s standard PR interface.

⸻

# Maintainers
	•	@ZtaMDev — Creator and Lead Maintainer

⸻

# Final Notes

Every contribution, regardless of size, helps improve Spectral Logs.
Maintaining clean, well-tested, and well-documented code is essential to keeping the library performant and reliable across platforms (Node.js, Bun, Deno, and browser builds).

Thank you for helping Spectral Logs evolve and stay at the highest technical standard.
