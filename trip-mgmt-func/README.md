## Getting Started

**Setup**

```bash
- npm install
- run npm install -g firebase-tools
- cp example.env .env
```

**Prepare to run project locally**

```bash
- Uncomment local chunk of code to run DB in index.ts
```

**Run locally with changes**

```bash
- npm run serve
```

**To update project packages**

```bash
- npm outdated
# this will update to all minor versions
- npm update
# this will update to all major versions
- npx npm-check-updates -u 
- npm install
```

**To deploy**

Goto parent directory and run

```bash 
firebase deploy --only functions
```