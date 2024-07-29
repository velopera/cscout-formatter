import * as fs from 'fs'

/** this file reads in a cscout call graph and filters it.  
 * It prints a digraph to stdout that can be fed into a graphviz layout engine (dot).
 * node dist/index.js cgraph.txt | |dot -Tsvg >out.svg
 */

class Main {
    lines = new Array<string>()
    // callMap = new Map<string, string>()
    callTargets = new Map<string, Array<string>>()

    fileMap = new Map<string, string>() // from->to map at file level

    incomingCount = new Map<string, number>() /// count of incoming edges
    incomingMap = new Map<string, Array<string>>() // incoming edges

    filesOnly = true
    collapseMultipleEdges = true
    noSelfLinks = false // do not link from->to where from==to

    ignoredFunctions = ["assert.h:__builtin_strrchr"]
    ignoredFiles = ["string.h", "stdio.h", "heap.c"]


    load() {

        let file = 'cgraph.txt'

        if (process.argv[process.argv.length - 1].indexOf('.txt') > 0) {
            file = process.argv[process.argv.length - 1]
        }

        let raw = fs.readFileSync(file).toString()
        this.lines = raw.split('\n')
    }

    private ignoreTarget(targ: string) {
        for (let t of this.ignoredFunctions) {
            if (t === targ) {
                return true
            }
        }
        // file level:
        let f = targ.split(":")[0]
        for (let file of this.ignoredFiles) {
            if (file === f) {
                return true
            }
        }
        return false
    }

    populate() {
        // we have key value pairs here: file:func  file:func
        for (let l of this.lines) {
            if (!l.length) {
                continue
            }
            let [from, targ] = l.split(' ')

            if (this.ignoreTarget(targ)) {
                continue
            }

            if (this.filesOnly) {
                from = from.split(":")[0]
                if (!targ) {
                    console.log(`TARG NOT |${l}| ${from} -> ${targ}`)
                }
                if (!targ.indexOf(":")) {
                    console.log(`TARG NOT ${from} -> ${targ}`)
                }
                targ = targ.split(":")[0]
            }

            // this.callMap.set(from, targ)

            this.addEdge(from, targ)
        }
    }

    private addEdge(from: string, targ: string) {
        if (this.noSelfLinks && from === targ) {
            return
        } 
        if (!this.callTargets.has(from)) {
            this.callTargets.set(from, new Array())
        }

        if (!this.incomingCount.has(targ)) {
            this.incomingCount.set(targ, 0)
        }
        let count = this.incomingCount.get(targ)!
        this.incomingCount.set(targ, count + 1)

        if (this.collapseMultipleEdges) {
            for (let edge of this.callTargets.get(from)!) {
                if (edge === targ) {
                    return // exists already, we're done.
                }
            }
        }
        this.callTargets.get(from)?.push(targ)

    }

    print() {
        // let keys = this.callMap.keys

        // let start = keys[0]

        console.log('digraph G {')
        // global settings
        console.log('     rankdir="LR"')
        console.log('     node [ ')
        console.log('         fontname=Sans;')
        console.log('         fontsize=12;style=filled')
        console.log('         style=filled;')
        console.log('         fillcolor=white')
        console.log('     ]')

        // private...
        function sanitize(inp: string): string {
            //let target = (links[i] as string).replace(/\./g,'_')
            return `"${inp}"`
        }

        let count = 0
        for (let [k, targets] of this.callTargets.entries()) {
            // console.log(key)
            if (!k.length) {
                break
            }
            let key = sanitize(k)
            let incomingEdges = this.incomingCount.get(k)!
            if (!incomingEdges) {
                // mark as unused
                console.log(`${key} [fillcolor=red]`)
            }
            for (let t of targets) {
                let targ = sanitize(t)
                if (!incomingEdges) {
                    // mark as unused
                    console.log(`${key} -> ${targ} [color=red]`)
                } else {
                    console.log(`${key} -> ${targ}`)
                }
            }
        }
        console.log('} /* digraph */')
    }

    run() {
        this.load()
        this.populate()
        this.print()
    }
}


let m = new Main()
m.run()