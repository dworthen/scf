package iowriters

type StdioWriterFunc = func(message string)

type StdioWriter struct {
	OnWrite StdioWriterFunc
}

func (sw *StdioWriter) Write(p []byte) (n int, err error) {
	n = len(p)
	if sw.OnWrite != nil {
		sw.OnWrite(string(p))
	}
	return n, nil
}

func NewStdioWriter(onWrite StdioWriterFunc) *StdioWriter {
	return &StdioWriter{
		OnWrite: onWrite,
	}
}
