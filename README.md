# cscout-formatter

this utility reads a reads a cscout callgraph file and prints a graphviz representation to stdout

### Compiling

Tested with nodejs v18, compiling is simple:

```
npm i 
npm run compile
```

### Usage:
```
node dist/index.js cgraph.txt >velopera.dot

# svg:
dot velopera.dot -Tsvg -o velopera.svg

# png:
dot velopera.dot -Tpng -o velopera.png

```

---

*This work has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No. 101070599 (SecOPERA)*
