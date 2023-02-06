---
title: "How to use variables in bash?"
publishDate: "06 february 2023"
description: "Variables are great constructs to store information for later use, how ever, in bash there are many different types of variables."
tags: ["bash", "automation", "programming"]
---

Bash defines 3 types of variables `shell Arguments`,`local variables`, and `environment variables`.

## Local Variables

local variables are tied to a shell script or a terminal session, there are great for accessing data later, and for modular software, you can declare a variable by

```bash
#!/usr/bin/env bash
name="mehdi"
```

Notice the `=` has no spacing with variable name, this is important and shell will error out if you put spaces around `=`.
To access the variable preside it with a `$` , for example to print the value in a variable use the `echo` command.

```shell
$ echo $name
```

You can assign your variables a default value using brace expression.

```bash
FOO=${FOO:-'default'}
```

you can also delete variables with `unset` command.

```shell
$ unset name
```

### Understand Bash Variable scope

every variable defined in a bash script is called a global variable. global in the context of the script and can be accessed from any where is the script, however you can define local variables in a functions using `local var=value`.

The variables are declared and populated with the function,when a function terminates these variables are flushed out from the process memory.

The example below showcase variable scopes,

```bash
#!/usr/bin/env bash

fruit="banana"

function hello(){
    local fruit="apple"
    echo $fruit
}

# calling hello function
hello

echo $fruit
```

in this script we are accessing the same variable `$fruit` in different scope in a function and global mode, in the function we defined a local variable with the same name and we echo it, after executing

```shell
# output
apple
banana
```

Another thing to watch out for is possessing values passed from users with potentially spaces, its recommend to always use `"$variable"` instead of `$variable`

```bash
filename="new doc.docx"
grep 'date' $filename
```

in this example the grep commend will try to search for date in two files `new` and `doc.docx` , because it tires white spaces as separate arguments, this is why it recommended to wrap variables in `""`

```bash
filename="new doc.docx"
grep 'date' "$filename"
```

Now grep will search in the file `new doc.docx`, this problem is very common in bash scripting, and can cause you some time debugging your scripts, so watch out for it.

Local variables are essential in Bash programming, and great for storing values for later use, variables can be strings,numbers or arrays. accessing a non declared variable will gives an empty string. There is another type predefined variables Positional arguments.

## Arguments

Arguments are special variables used to access input from uses, arguments can be passed to either a script or a function within a script.

```shell
$ ./myscript.sh arg1 arg2
```

In this example, we passed two arguments to the script, the `$1=arg1`, `$2=arg2`, and `$0=./myscript.sh` arguments can be passed to either scripts or functions, you find a table below of all possible arguments and theirs meanings.

| Argument  | Description                              |
| --------- | ---------------------------------------- |
| $0        | the script file name prefixed with `./`  |
| $1 to $10 | first 10 arguments passed to script      |
| $N        | the Nth argument passed to script        |
| $FUNCNAME | the function name within a function body |

Positional arguments are used to pass values to functions or scripts, but what if you want to pass values to another script from within a script, you can use environment variables.

## Environment Variables

Special variable that change the behavior of underlying Operating system or its corresponding processes/programs, the management of there variable is outside programs, its the operating system job to manage the life cycle of these variables, running programs can access there variables.

You can declare a environment variable using `export` keyword, any process forked from the current shell session will inherit these variables and can access them.

```shell
$ export VAR="value"
```

Environment vars are tied to process, when process terminates, they are gone, to persist variables you can append the commend above in special files `.bashrc` or `.bash_profile` in your home directory.

You can also print all environment vars defined in your shell session with commands below.

```shell
$ env
or
$ printenv
```

To search for a variable you can use pipes and `grep` command

```shell
$ env | grep 'VAR'
```

Environment variables are great for configuring programs, passing values to processes and more, in the table below I have listed the most practical ones, in bash scripting.
| Environment Variable | Description|
|---------------------|-------------|
| $HOME | The user home directory executing the script |
| $PWD | The working directory where the script is located |
| $RANDOM | Random integer between 0 and 32767 |
| $HOST | The machine's hostname executing the script|
| $USER | user executing the script |
| $PATH | Columns separated paths where the shell search for commands|
| $UID | the user ID |
| $GID | the user group ID |

Environment variables are great for accessing system information and they come handy in system programing and in system administration.

## Conclusion

In this post, we discussed different variables in Bash, Local Variables,Positional Arguments, and Environment Variables, each one has its capabilities and use cases.
