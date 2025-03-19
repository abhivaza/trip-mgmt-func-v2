## Getting Started

**Setup**

```bash
- run npm install -g firebase-tools
```

**Prepare to run project locally**

```bash
- Uncomment local chunk of code to run DB in intex.ts
```

**Run locallcy with changes**

```bash
- npm run serve
```

**To udpdate project packages**

```bash
- npm outdated
# this will update to all miror versions
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