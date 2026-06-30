package server

import (
	"net/http"
	"time"

	"github.com/lwmacct/260630-go-hsr-shared/pkg/httpserver"

	"github.com/lwmacct/260630-go-hsr-final/internal/config"
)

const httpAPIPrefix = "/api"

func newHTTPServer(cfg *config.Config, deps *dependencies) *http.Server {
	httpCfg := cfg.Server.HTTP
	srv := &http.Server{
		Addr:              httpCfg.Listen,
		Handler:           newHTTPHandler(cfg, deps),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       httpCfg.ReadTimeout,
		WriteTimeout:      httpCfg.WriteTimeout,
		IdleTimeout:       httpCfg.IdleTimeout,
	}

	if deps.tls == nil || deps.tls.TLSConfig() == nil {
		return srv
	}

	srv.TLSConfig = deps.tls.TLSConfig()
	return srv
}

func newHTTPHandler(cfg *config.Config, deps *dependencies) http.Handler {
	mux := http.NewServeMux()
	mux.Handle(httpAPIPrefix+"/", http.StripPrefix(httpAPIPrefix, newHTTPAPIHandler(cfg, deps)))

	if cfg.Server.HTTP.WebRoot != "" {
		mux.Handle("/", http.FileServer(http.Dir(cfg.Server.HTTP.WebRoot)))
	}

	return deps.requests.Wrap(mux)
}

func newHTTPAPIHandler(cfg *config.Config, deps *dependencies) http.Handler {
	maxBodyBytes := cfg.Server.HTTP.MaxAPIBodyBytes
	if maxBodyBytes < 0 {
		maxBodyBytes = 0
	}
	return httpserver.LimitRequestBody(deps.auth.Handler(), maxBodyBytes)
}
