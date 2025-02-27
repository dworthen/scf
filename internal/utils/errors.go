package utils

import (
	"errors"
	"fmt"
	"log/slog"
	"os"
	"runtime"
)

func CheckError(err error) {
	if err != nil {
		slog.Error("Error", "err", err)
		fmt.Fprintf(os.Stderr, "Error: %s\n", err)
		os.Exit(1)
	}
}

type WithStackTraceError struct {
	err error
}

func (e *WithStackTraceError) Error() string {
	return e.err.Error()
}

func NewWithStackTraceError(err error) *WithStackTraceError {
	if errors.Is(err, &WithStackTraceError{}) {
		return err.(*WithStackTraceError)
	}
	buf := make([]byte, 1024)
	n := runtime.Stack(buf, false)
	return &WithStackTraceError{
		err: fmt.Errorf("%w\nStack trace: %s", err, buf[:n]),
	}
}
