package iowriters

type ProgressWriterFunc = func(progressIncrementAmount float64)

type ProgressWriter struct {
	Total      int
	OnProgress ProgressWriterFunc
}

func (pw *ProgressWriter) Write(p []byte) (n int, err error) {
	n = len(p)
	incAmount := float64(n) / float64(pw.Total)
	if pw.OnProgress != nil {
		pw.OnProgress(incAmount)
	}
	return n, nil
}

func NewProgressWriter(total int, onProgress ProgressWriterFunc) *ProgressWriter {
	return &ProgressWriter{
		Total:      total,
		OnProgress: onProgress,
	}
}
