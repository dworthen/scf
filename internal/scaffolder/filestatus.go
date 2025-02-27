package scaffolder

import (
	"sort"
	"sync"
)

type FileStatus struct {
	m     sync.RWMutex
	Files map[string]string
}

func NewFileStatus() *FileStatus {
	return &FileStatus{
		Files: map[string]string{},
	}
}

func (f *FileStatus) Get(file string) (string, bool) {
	f.m.RLock()
	defer f.m.RUnlock()
	v, ok := f.Files[file]
	return v, ok
}

func (f *FileStatus) Set(file string, status string) {
	f.m.Lock()
	defer f.m.Unlock()
	f.Files[file] = status
}

func (f *FileStatus) ToString() string {
	f.m.RLock()
	defer f.m.RUnlock()
	str := ""
	keys := make([]string, 0, len(f.Files))
	for key := range f.Files {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		str += key + ": " + f.Files[key] + "\n"
	}
	return str
}
