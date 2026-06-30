package server

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFinalAppUsesModulePublicPackagesOnly(t *testing.T) {
	root := projectRoot(t)
	internalPrefixes := []string{
		"github.com/lwmacct/260630-go-hsr-auth/internal/",
		"github.com/lwmacct/260630-go-hsr-audit/internal/",
		"github.com/lwmacct/260630-go-hsr-oauth/internal/",
	}
	for _, file := range goFiles(t, root) {
		for _, importPath := range importsInFile(t, file) {
			for _, prefix := range internalPrefixes {
				if strings.HasPrefix(importPath, prefix) {
					t.Fatalf("final app must not import module internals: %s imports %s", file, importPath)
				}
			}
		}
	}
}

func TestServerModuleFilesDefineOneModuleStruct(t *testing.T) {
	root := projectRoot(t)
	files, err := filepath.Glob(filepath.Join(root, "internal", "appcmd", "server", "*.module.go"))
	if err != nil {
		t.Fatal(err)
	}
	if len(files) == 0 {
		t.Fatal("no server module files found")
	}
	for _, file := range files {
		structs := structNamesInFile(t, file)
		var modules []string
		for _, name := range structs {
			if strings.HasSuffix(name, "Module") {
				modules = append(modules, name)
			}
		}
		if len(modules) != 1 {
			t.Fatalf("%s must define exactly one *Module struct, got %v", file, modules)
		}
	}
}

func projectRoot(t *testing.T) string {
	t.Helper()

	dir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Fatal("project root not found")
		}
		dir = parent
	}
}

func goFiles(t *testing.T, root string) []string {
	t.Helper()

	var files []string
	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			switch entry.Name() {
			case ".git", "vendor":
				return filepath.SkipDir
			}
			return nil
		}
		if strings.HasSuffix(path, ".go") {
			files = append(files, path)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	return files
}

func importsInFile(t *testing.T, file string) []string {
	t.Helper()

	fset := token.NewFileSet()
	parsed, err := parser.ParseFile(fset, file, nil, parser.ImportsOnly)
	if err != nil {
		t.Fatal(err)
	}
	imports := make([]string, 0, len(parsed.Imports))
	for _, item := range parsed.Imports {
		imports = append(imports, strings.Trim(item.Path.Value, `"`))
	}
	return imports
}

func structNamesInFile(t *testing.T, file string) []string {
	t.Helper()

	fset := token.NewFileSet()
	parsed, err := parser.ParseFile(fset, file, nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	var names []string
	ast.Inspect(parsed, func(node ast.Node) bool {
		spec, ok := node.(*ast.TypeSpec)
		if !ok {
			return true
		}
		if _, ok := spec.Type.(*ast.StructType); ok {
			names = append(names, spec.Name.Name)
		}
		return true
	})
	return names
}
