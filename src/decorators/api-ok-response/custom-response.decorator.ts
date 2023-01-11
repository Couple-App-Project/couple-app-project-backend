import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ReferenceObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ResponseDto } from '../../common/dtos/response.dto';

/**
 * @paginated false
 * @response_type string
 * @response_dto single
 *
 * @param dataDto 타입 dto
 *
 * @example
 * { data : dataDto }
 */
export const ApiCustomResponseByDto = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: {
                allOf: [{ $ref: getSchemaPath(dataDto) }],
              },
            },
          },
        ],
      },
    }),
  );

/**
 * @paginated false
 * @response_type string
 * @response_dto multiple
 *
 * @param dataDto response 타입별 dtos
 *
 * @example
 *  type responseDto = dataDto1 | dataDto2 | ... dataDtoN
 * { data : responseDto }
 */
export const ApiCustomResponseByDtos = (...dataDto: any[]) => {
  const oneOfContainer: ReferenceObject[] = [];
  dataDto.map((dto) => oneOfContainer.push({ $ref: getSchemaPath(dto) }));

  return applyDecorators(
    ApiExtraModels(ResponseDto, ...dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: {
                oneOf: oneOfContainer,
              },
            },
          },
        ],
      },
    }),
  );
};
