package pipelinemodel

import "fmt"

type OutOfPipelineIndexError struct {
	Index int
}

func (e *OutOfPipelineIndexError) Error() string {
	return fmt.Sprintf("index %d is out of range of pipeline models.", e.Index)
}

func NewOutOfPipelineIndexError(index int) error {
	return &OutOfPipelineIndexError{
		Index: index,
	}
}
