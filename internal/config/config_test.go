package config

import "testing"

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()
	if cfg.Server.Database.Type == "" {
		t.Fatal("database type is empty")
	}
	if cfg.Server.HTTP.Listen == "" {
		t.Fatal("http listen is empty")
	}
	if !cfg.Server.Auth.Local.LoginEnabled {
		t.Fatal("local login should be enabled by default")
	}
}
