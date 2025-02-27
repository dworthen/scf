package forms

import "sync"

type formResults struct {
	m       *sync.RWMutex
	Results map[string]interface{} `json:"results"`
}

func (f *formResults) Get(key string) (interface{}, bool) {
	f.m.RLock()
	defer f.m.RUnlock()
	result, ok := f.Results[key]
	return result, ok
}

func (f *formResults) Set(key string, value interface{}) {
	f.m.Lock()
	defer f.m.Unlock()
	f.Results[key] = value
}

func NewFormResults() *formResults {
	return &formResults{
		m:       &sync.RWMutex{},
		Results: map[string]interface{}{},
	}
}

var formResultsSingleton *formResults
var formResultsOnce sync.Once

func GetFormResultsSingleton() *formResults {
	formResultsOnce.Do(func() {
		formResultsSingleton = NewFormResults()
	})
	return formResultsSingleton
}
